'use client';

import { useEffect, useState, useRef } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import Header from "@/components/header/header";
import Card from "@/components/card/card";
import Footer from "@/components/footer/footer";
import ProcessSteps from "@/components/loader/process-steps";
import DotsLoader from "@/components/loader/dots-loader"

import { getIp } from "@/services/totem.service";
import { checkPosStatus, postPayment } from '@/services/amos.service';
import { getServicios, postVentas } from '@/services/banio.service';
import { createUser } from '@/services/torniquete.service';

import { voucher, generateCode } from '@/utils/helpers';

export default function HomePage() {

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [posStatus, setPosStatus] = useState(null);

  // refs para controlar estado fuera del render
  const isMountedRef = useRef(true);
  const monitorIntervalRef = useRef(null);
  const monitorInFlightRef = useRef(false);
  const monitorAbortRef = useRef(null);

  useEffect(() => {

    localStorage.clear();
    let mounted = true;
    let intervalId;

    const initializeApp = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setDisabled(true);

        // 1) Obtener IP con reintento
        let dataIP = {};
        while (mounted && !dataIP.ip) {
          try {
            dataIP = await getIp();
            if (!dataIP || !dataIP.ip) throw new Error("IP inválida");

            localStorage.setItem("ip", dataIP.ip);
            localStorage.setItem("ip_totem", dataIP.ip_totem);
            if (dataIP.ubicacion) localStorage.setItem("site", dataIP.ubicacion);

            console.log("IP obtenida:", dataIP.ip);
          } catch (err) {
            console.warn("Error al obtener IP:", err.message || err);
            await new Promise((r) => setTimeout(r, 3000));
          }
        }

        // 2) Verificar POS antes de cargar servicios
        const online = await checkPosStatus();
        setPosStatus(online);
        setDisabled(!online);

        if (online && mounted) {
          try {
            const data = await getServicios();
            setServicios(data || []);
          } catch (err) {
            console.error("Error cargando servicios:", err.message || err);
            setError("No se pudieron cargar los servicios");
          }

          // 3) Iniciar monitor cada 10s
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
          setError("Error inicializando aplicación");
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
  }, []);


  const createUserWithRetries = async (token, {
    maxAttempts = 4,
    initialDelay = 1000
  } = {}) => {
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

        await new Promise(res => setTimeout(res, wait));
      }
    }

    throw lastError ?? new Error('No se pudo crear el acceso después de varios intentos');
  };

  const showPaymentResult = (result, amount) => {
    const approved = result?.data?.approved;
    const message = result?.data?.rawData?.responseMessage ?? result?.message ?? '';

    if (approved) {
      Swal.fire({
        icon: 'success',
        title: 'Pago Aprobado',
        html: `<p>${message}</p><p><strong>Monto:</strong> ${amount}</p>`,
        confirmButtonText: 'Aceptar'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Pago Fallido',
        html: `<p>${message}</p><p><strong>Monto:</strong> ${amount}</p>`,
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleClick = async (amount, name, servicio) => {
    if (loading || disabled) return;

    setLoading(true);

    const ticketNumber = generateCode();

    Swal.fire({
      title: 'Procesando pago',
      html: `Monto: <b>${amount}</b><br>Siga las instrucciones del equipo...`,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false
    });

    try {
      // Verificar que el POS esté disponible
      const posReady = await checkPosStatus();
      if (!posReady) {
        throw new Error('POS no disponible. Verifique la conexión.');
      }

      const qrData = ticketNumber;

      // Crear usuario con reintentos
      try {
        await createUserWithRetries(qrData, { maxAttempts: 4, initialDelay: 1000 });
        console.log('Usuario creado correctamente: ', qrData);
      } catch (createErr) {
        console.error('Fallo al crear usuario tras reintentos:', createErr);
        Swal.close();
        setError(createErr?.message ?? 'No se pudo crear el acceso en el sistema del torniquete');
        Swal.fire({
          icon: 'error',
          title: 'Error creando acceso',
          html: `<p>${createErr?.message ?? 'No se pudo crear el acceso. Intente nuevamente.'}</p>`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      // Procesar pago
      const payload = { amount, ticketNumber };
      console.log('Enviando pago:', payload);

      const result = await postPayment(payload);

      Swal.close();
      showPaymentResult(result, amount);

      if (result.data?.approved) {
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
        const accountNumber = result.data.rawData.accountNumber || '---';
        const tipo_cuota = result.data.rawData.shareType || 'SIN CUOTA';
        const numero_cuota = result.data.rawData.sharesNumber || '0';
        const monto_cuota = result.data.rawData.sharesAmount || '0';
        const estadoMensaje = result.data.rawData.responseMessage || '';

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
        const formattedDate = fecha ? `${fecha.slice(0, 2)}/${fecha.slice(2, 4)}/${fecha.slice(4)}` : fecha;
        const formattedTime = hora ? `${hora.slice(0, 2)}:${hora.slice(2, 4)}:${hora.slice(4)}` : hora;

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
          monto_cuota
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
            ubicacion: site
          }

          const res = await postVentas(payload);
          console.log(res.message);
        } catch (err) {
          console.error("Error al registrar venta: " + err.message);
        }

        // Imprimir voucher
        try {
          const res = await fetch('/api/print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: content,
              qrData: qrData
            })
          });

          const data = await res.json();

          if (data.error) throw new Error(data.error);

          // Abrir RawBT para imprimir
          window.location.href = data.rawbt;

          // Recargar servicios después de un tiempo
          setTimeout(() => {
            loadServicios();
          }, 2000);
        } catch (err) {
          console.error('Error al imprimir voucher:', err);
          Swal.fire({
            icon: 'warning',
            title: 'Pago exitoso',
            text: 'Pago procesado pero hubo un error al imprimir el comprobante',
            confirmButtonText: 'Aceptar'
          });
        }
      } else {
        // Si el pago no fue aprobado, recargar servicios
        setTimeout(() => {
          loadServicios();
        }, 1000);
      }
    } catch (err) {
      console.error('Error en pago:', err);
      setError(err?.message ?? 'Error al procesar pago');
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: `<p>${err?.message ?? 'Error inesperado'}</p>`,
        confirmButtonText: 'Aceptar'
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
      console.error('Error cargando servicios:', err);
      setError(err?.message ?? 'Error al cargar servicios');
    }
  };

  const fetchServicios = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loadServicios();
    } catch (err) {
      setError(err?.message ?? 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-gradient-to-b from-blue-400 to-blue-100 "
      style={{ padding: "150px 80px" }}
    >

      <Header onClick={() => window.location.reload()}/>

      <div
        className="font-bold mb-20 text-white text-8xl text-center"
      >
        ¡Selecciona tu Servicio!
      </div>

      {error && (
        <div className="text-red-600 text-4xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center text-5xl mb-15 text-white gap-5">
          <p>Cargando servicios</p>
          <DotsLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-20 mb-20">
          {servicios.map(s => (
            <Card
              key={s.id}
              image={s.nombre}
              name={s.nombre}
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
