'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import Header from '@/components/header/header';
import Card from '@/components/card/card';
import Footer from '@/components/footer/footer';
import { DotsLoader } from '@/components/loader/dots-loader';

import { serviciosService } from '@/lib/servicios.service';
import { paymentService } from '@/lib/payment.service';
import { userService } from '@/lib/user.service';
import { voucher, generateCode } from '@/utils/helpers';


export default function HomePage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [posStatus, setPosStatus] = useState(null);


  const checkPosStatus = async () => {
    try {

      const monitorStatus = await paymentService.getMonitor();

      console.log('Estado del POS:', monitorStatus);
      setPosStatus(monitorStatus);

      const isAvailable = monitorStatus.server === true;

      setDisabled(!isAvailable);
      return isAvailable;
    } catch (err) {
      console.error('Error verificando estado del POS:', err);
      setDisabled(true);
      setError('POS no disponible - ' + (err?.message ?? 'Error de conexión'));
      return false;
    }
  }

  const loadServicios = async () => {
    try {
      const data = await serviciosService.getServicios();
      setServicios(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      setError(err?.message ?? 'Error al cargar servicios');
    }
  };

  useEffect(() => {
    // cargar servicios
    let mounted = true;
    let intervalId;
    const initializeApp = async () => {
      try {
        const posReady = await checkPosStatus();

        if (posReady && mounted) {
          await loadServicios();
          intervalId = setInterval(async () => {
            if (mounted) {
              await checkPosStatus();
            }
          }, 10000);
        } else if (mounted) {
          setTimeout(() => {
            if (mounted) initializeApp();
          }, 5000);
        }
      } catch (err) {
        console.error('Error inicializando app:', err);
        if (mounted) {
          setError('Error inicializando aplicación');
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadServicios();
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);


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
    setPaymentResponse(null);

    const ticketNumber = String(Date.now());

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

    const createUserWithRetries = async (token, {
      maxAttempts = 4,
      initialDelay = 800 // ms
    } = {}) => {
      let attempt = 0;
      let lastError = null;

      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          // Si tu servicio expone createUser que internamente llama addUser + addLevel,
          // lo usamos directamente. Si prefieres intentar pasos separados, cambia aquí.
          await userService.createUser(token);
          return true; // creado correctamente
        } catch (err) {
          lastError = err;
          console.warn(`Intento ${attempt} fallo al crear usuario:`, err);

          // Si es el último intento, romper y propagar el error más abajo
          if (attempt >= maxAttempts) break;

          // backoff exponencial con jitter
          const backoff = Math.floor(initialDelay * Math.pow(2, attempt - 1));
          const jitter = Math.floor(Math.random() * Math.min(300, backoff));
          const wait = backoff + jitter;

          await new Promise(res => setTimeout(res, wait));
        }
      }

      // si llegamos acá, todos los intentos fallaron
      throw lastError ?? new Error('No se pudo crear el acceso después de varios intentos');
    };



    try {
      // Verificar que el POS siga disponible antes del pago
      const posReady = await checkPosStatus();
      if (!posReady) {
        throw new Error('POS no disponible. Verifique la conexión.');
      }

      const qrData = generateCode();

      try {
        await createUserWithRetries(qrData, { maxAttempts: 4, initialDelay: 800 });
        console.log('Usuario creado correctamente: ', qrData);
      } catch (createErr) {
        console.error('Fallo al crear usuario tras reintentos:', createErr);
        // cerrar swal de carga y mostrar mensaje de error, no hacemos el pago
        Swal.close();
        setError(createErr?.message ?? 'No se pudo crear el acceso en el sistema del torniquete');
        Swal.fire({
          icon: 'error',
          title: 'Error creando acceso',
          html: `<p>${createErr?.message ?? 'No se pudo crear el acceso. Intente nuevamente.'}</p>`,
          confirmButtonText: 'Aceptar'
        });
        return; // abortamos todo — NO se envía el pago
      }

      const payload = { amount, ticketNumber };
      console.log('Enviando pago:', payload);

      const result = await paymentService.postPayment(payload);

      setPaymentResponse(result);

      Swal.close();

      showPaymentResult(result, amount);

      if (result.data?.approved) {
        const fecha = result.data.rawData.realDate;
        const hora = result.data.rawData.realTime;
        const monto = result.data.rawData.amount;
        const tipo = name;
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

        const user = JSON.parse(localStorage.getItem("user"));
        // Formatear fecha y hora si es necesario
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

        try {
          const payload = {
            monto: amount,
            metodo_pago: "tarjeta",
            estado: estadoMensaje,
            id_transaccion: operationNumber,
            codigo_autorizacion: authCode,
            codigo_comercio: codigoComercio,
            usuario_id: user.id,
            servicio_id: servicio
          }

          const res = await serviciosService.postVentas(payload)

          console.log(res.message);
        } catch (err) {
          console.error("Error al registrar venta: " + err.message);
        }

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
          // window.location.href = data.rawbt;

          setTimeout(() => {
            loadServicios();
          }, 2000);
        } catch (err) {
          console.error('Error al imprimir voucher:', err);
          // Mostrar error pero no bloquear el flujo
          Swal.fire({
            icon: 'warning',
            title: 'Pago exitoso',
            text: 'Pago procesado pero hubo un error al imprimir el comprobante',
            confirmButtonText: 'Aceptar'
          });
        }
      } else {
        // Si el pago no fue aprobado, solo recargar servicios
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


  return (
    <div
      className="min-h-screen w-full flex flex-col items-center font-sans"
      style={{ padding: "150px 80px" }}
    >

      <Header onClick={fetchServicios} />

      <Image
        src="/LOGOTIPO_BANO.png"
        alt="Logo Baño"
        className='my-10'
        style={{
          filter: "invert(50%) sepia(100%) saturate(500%) hue-rotate(180deg)"
        }}
        width={250}
        height={250}
      />

      <div className="text-4xl font-bold mb-10 text-[var(--primary)]">
        Elija la opción según servicio, para imprimir Ticket.
      </div>

      {disabled && (
        <div className="text-2xl font-semibold text-white flex items-center gap-2">
          <span>Esperando al servidor</span>
          <DotsLoader />
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600" role="status" aria-live="polite">
          {error}
        </div>
      )}

      <div className="w-full max-w-3xl mt-6">
        {loading && !paymentResponse && (
          <div className="p-4">Procesando...</div>
        )}

        <div className="flex flex-col items-center justify-center gap-20">
          {servicios.map(s => (
            <Card
              key={s.id}
              servicio={s.nombre}
              precio={s.precio}
              onClick={() => handleClick(s.precio, s.nombre, s.id)}
              disabled={disabled || loading}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
