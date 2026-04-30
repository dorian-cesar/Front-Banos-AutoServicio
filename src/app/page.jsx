"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Header from "@/components/header/header";
import Card from "@/components/card/card";
import Footer from "@/components/footer/footer";
import ProcessSteps from "@/components/loader/process-steps";
import DotsLoader from "@/components/loader/dots-loader";
import { useLanguage } from "@/context/LanguageContext";

import { checkPosStatus, postPayment } from "@/services/amos.service";
import { getServicios, postVentas } from "@/services/banio.service";
import { createUser } from "@/services/torniquete.service";
import TotemConfig from "@/components/config/totem-config";

import { voucher, generateCode } from "@/utils/helpers";

export default function HomePage() {
  const { t } = useLanguage();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [posStatus, setPosStatus] = useState(null);
  const [isIdentified, setIsIdentified] = useState(false);

  useEffect(() => {
    // Solo ejecutamos la inicialización si ya estamos identificados
    if (!isIdentified) {
      localStorage.clear();
      setLoading(false);
      return;
    }

    let mounted = true;
    let intervalId;

    const initializeApp = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setDisabled(true);

        // 1) El IP ya viene del proceso de identificación, lo leemos de localStorage
        const storedIp = localStorage.getItem("ip");
        console.log("Iniciando con IP identificada:", storedIp);

        // 2) Verificar POS antes de cargar servicios (Reintento infinito cada 5s)
        let online = false;
        while (mounted && !online) {
          setLoadingMessage(t("page.waitingServer"));
          online = await checkPosStatus();
          setPosStatus(online);
          setDisabled(!online);

          if (!online) {
            console.log("Servidor no listo, reintentando en 5s...");
            await new Promise((r) => setTimeout(r, 5000));
          }
        }

        if (online && mounted) {
          try {
            const data = await getServicios();
            setServicios(data || []);
          } catch (err) {
            console.error("Error cargando servicios:", err.message || err);
            setError(t("page.errorLoading"));
          }

          // 3) Iniciar monitor cada 15s
          intervalId = setInterval(async () => {
            try {
              const status = await checkPosStatus();
              setPosStatus(status);
              setDisabled(!status);
            } catch (err) {
              console.warn("Monitor falló:", err.message);
              setPosStatus(false);
              setDisabled(true);
            }
          }, 15000);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error inicializando:", err);
        if (mounted) {
          setError(t("page.errorInit"));
          setLoading(false);
          setDisabled(true);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [isIdentified]);

  const createUserWithRetries = async (
    token,
    { maxAttempts = 4, initialDelay = 1000 } = {},
  ) => {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        await createUser(token);
        return true;
      } catch (err) {
        lastError = err;
        console.warn(`Intento ${attempt} fallo al crear usuario:`, err);

        if (attempt >= maxAttempts) break;

        const backoff = Math.floor(initialDelay * Math.pow(2, attempt - 1));
        const jitter = Math.floor(Math.random() * Math.min(300, backoff));
        const wait = backoff + jitter;

        await new Promise((res) => setTimeout(res, wait));
      }
    }

    throw (
      lastError ??
      new Error("No se pudo crear el acceso después de varios intentos")
    );
  };

  const showPaymentResult = (result, amount) => {
    const approved = result?.data?.approved;
    const message =
      result?.data?.rawData?.responseMessage ?? result?.message ?? "";

    if (approved) {
      Swal.fire({
        icon: "success",
        title: t("page.paymentApproved"),
        html: `<p>${message}</p><p><strong>${t("page.amount")}:</strong> ${amount}</p>`,
        showConfirmButton: false,
        timer: 2000, // se cierra automáticamente después de 2 segundos
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: t("page.paymentFailed"),
        html: `<p>${message}</p><p><strong>${t("page.amount")}:</strong> ${amount}</p>`,
        confirmButtonText: t("page.accept"),
      });
    }
  };

  const handleClick = async (amount, name, servicio) => {
    if (loading || disabled) return;

    // Mostrar aviso para el servicio "Ducha"
    if (name === "Ducha") {
      const result = await Swal.fire({
        icon: "info",
        title: t("page.remember"),
        text: t("page.showerReminder"),
        confirmButtonText: t("page.understood"),
        allowOutsideClick: false,
      });

      if (!result.isConfirmed) {
        return; // Si no confirma, no continúa con el pago
      }
    }

    setLoading(true);

    const ticketNumber = await generateCode();

    Swal.fire({
      title: t("page.processingPayment"),
      html: `${t("page.amount")}: <b>${amount}</b><br>${t("page.followInstructions")}`,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });

    try {
      // Verificar que el POS esté disponible
      const posReady = await checkPosStatus();
      if (!posReady) {
        throw new Error(t("page.posUnavailable"));
      }

      // Procesar pago
      const payload = { amount, ticketNumber };
      console.log("Enviando pago:", payload);

      const result = await postPayment(payload);

      Swal.close();
      showPaymentResult(result, amount);

      if (result.data?.approved) {
        // Crear usuario en el torniquete después de que el pago sea aprobado
        const qrData = ticketNumber;
        try {
          await createUserWithRetries(qrData, {
            maxAttempts: 4,
            initialDelay: 1000,
          });
          console.log("Usuario creado correctamente post-pago: ", qrData);
        } catch (createErr) {
          console.error("Fallo al crear usuario post-pago:", createErr);
          // Notificar pero no detener el flujo ya que el pago fue exitoso
          Swal.fire({
            icon: "warning",
            title: t("page.paymentSuccess"),
            text: t("page.printError"),
            confirmButtonText: t("page.accept"),
          });
        }

        const fecha = result.data.rawData.realDate;
        const hora = result.data.rawData.realTime;
        const monto = result.data.rawData.amount;
        const tipo = name.replace(/baño/gi, "Bano");
        const codigoComercio = result.data.rawData.commerceCode;
        const terminalId = result.data.rawData.terminalId;
        const cardNumber = result.data.rawData.last4Digits;
        const cardType = result.data.rawData.cardType;
        const operationNumber = result.data.rawData.operationNumber;
        const authCode = result.data.rawData.authorizationCode;
        const accountNumber = result.data.rawData.accountNumber || "---";
        const tipo_cuota = result.data.rawData.shareType || "SIN CUOTA";
        const numero_cuota = result.data.rawData.sharesNumber || "0";
        const monto_cuota = result.data.rawData.sharesAmount || "0";
        const estadoMensaje = result.data.rawData.responseMessage || "";

        const getUserFromStorage = () => {
          try {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;
          } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            return null;
          }
        };

        const getIpFromStorage = () => localStorage.getItem("ip");
        const getSiteFromStorage = () => localStorage.getItem("site");
        const user = getUserFromStorage();
        const ip = getIpFromStorage();
        const site = getSiteFromStorage();

        // Formatear fecha y hora
        const formattedDate = fecha
          ? `${fecha.slice(0, 2)}/${fecha.slice(2, 4)}/${fecha.slice(4)}`
          : fecha;
        const formattedTime = hora
          ? `${hora.slice(0, 2)}:${hora.slice(2, 4)}:${hora.slice(4)}`
          : hora;

        const content = voucher(
          codigoComercio,
          formattedDate,
          formattedTime,
          terminalId,
          cardNumber,
          cardType,
          monto,
          accountNumber,
          operationNumber,
          tipo,
          authCode,
          numero_cuota,
          tipo_cuota,
          monto_cuota,
        );

        // Registrar venta en el sistema
        try {
          const payload = {
            monto: amount,
            metodo_pago: "tarjeta",
            estado: estadoMensaje,
            id_transaccion: operationNumber,
            codigo_autorizacion: authCode,
            codigo_comercio: codigoComercio,
            usuario_id: user.id,
            servicio_id: servicio,
            ip_amos: ip,
            ubicacion: site,
          };

          const res = await postVentas(payload);
          console.log(res.message);
        } catch (err) {
          console.error("Error al registrar venta: " + err.message);
        }

        // Imprimir voucher
        try {
          const res = await fetch("/api/print", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: content,
              qrData: qrData,
            }),
          });

          const data = await res.json();

          if (data.error) throw new Error(data.error);

          // Abrir RawBT para imprimir
          window.location.href = data.rawbt;

          // Recargar servicios después de un tiempo
          // setTimeout(() => {
          //   loadServicios();
          // }, 2000);
        } catch (err) {
          console.error("Error al imprimir voucher:", err);
          Swal.fire({
            icon: "warning",
            title: t("page.paymentSuccess"),
            text: t("page.printError"),
            confirmButtonText: t("page.accept"),
          });
        }
      } else {
        // Si el pago no fue aprobado, recargar servicios
        // setTimeout(() => {
        //   loadServicios();
        // }, 1000);
      }
    } catch (err) {
      console.error("Error en pago:", err);
      setError(err?.message ?? t("page.paymentProcessError"));
      Swal.close();
      Swal.fire({
        icon: "error",
        title: t("page.error"),
        html: `<p>${err?.message ?? t("page.unexpectedError")}</p>`,
        confirmButtonText: t("page.accept"),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadServicios = async () => {
    try {
      const data = await getServicios();
      setServicios(data || []);
    } catch (err) {
      console.error("Error cargando servicios:", err);
      setError(err?.message ?? t("page.serviceLoadError"));
    }
  };

  const fetchServicios = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loadServicios();
    } catch (err) {
      setError(err?.message ?? t("page.serviceLoadError"));
    } finally {
      setLoading(false);
    }
  };

  if (!isIdentified) {
    return <TotemConfig onSuccess={() => setIsIdentified(true)} />;
  }

  const handleReset = () => {
    setError(null);
    loadServicios();
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-gradient-to-b from-blue-400 to-blue-100 "
      style={{ padding: "150px 80px" }}
    >
      <Header onClick={handleReset} />

      <div className="font-bold mb-20 text-white text-8xl text-center">
        {t("page.selectService")}
      </div>

      {error && <div className="text-red-600 text-4xl">{error}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center text-5xl mb-15 text-white gap-8">
          <p className="font-bold">{loadingMessage || t("page.loading")}</p>
          <DotsLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-20 mb-20">
          {servicios.map((s) => (
            <Card
              key={s.id}
              image={s.nombre}
              name={t(`service.${s.nombre}`, s.nombre)}
              price={s.precio}
              onClick={() => handleClick(s.precio, s.nombre, s.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      <ProcessSteps />

      <Footer />
    </div>
  );
}
