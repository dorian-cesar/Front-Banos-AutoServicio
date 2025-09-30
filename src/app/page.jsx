'use client';

import { useEffect, useState } from 'react';
import { CircleX, CircleCheck } from 'lucide-react';
import Image from 'next/image';

import Header from '@/components/header/header';
import Card from '@/components/card/card';
import Footer from '@/components/footer/footer';
import Modal from '@/components/modal/modal';

import { serviciosService } from '@/lib/servicios.service';
import { paymentService } from '@/lib/payment.service';
import { localService } from '@/lib/local.service';

export default function HomePage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [posStatus, setPosStatus] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setCurrentAmount(null);
    setPaymentResponse(null);
  };

  const checkPosStatus = async () => {
    try {
      const ipData = await localService.getIp();
      const ip = ipData.ip;

      console.log('IP obtenida:', ip);

      const monitorUrl = `http://${ip}:3000`;
      const monitorStatus = await paymentService.get('/monitor', monitorUrl);

      setPosStatus(monitorStatus);

      const isAvalible = monitorStatus.server === true;

      setDisabled(!isAvalible);

      return (isAvalible);
    } catch (err) {
      console.error('Error verificando estado del POS:', err);
      setDisabled(true);
      setError('Error obteniendo ip');
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


  const handleClick = async (amount) => {
    if (loading || disabled) return;

    setLoading(true);
    setCurrentAmount(amount);
    setPaymentResponse(null);
    setOpen(true);

    try {
      // Verificar que el POS siga disponible antes del pago
      const posReady = await checkPosStatus();
      if (!posReady) {
        throw new Error('POS no disponible. Verifique la conexión.');
      }

      const ticketNumber = String(Date.now());
      const payload = { amount, ticketNumber };
      console.log('Enviando pago:', payload);

      const result = await paymentService.postPayment(payload);

      setPaymentResponse(result);

      // Recargar servicios después del pago exitoso
      if (result.data?.approved) {
        setTimeout(() => {
          loadServicios();
        }, 1000);
      }
    } catch (err) {
      console.error('Error en pago:', err);
      setError(err?.message ?? 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center gap-8 font-sans w-full min-h-screen relative bg-gradient-to-br from-blue-50 to-indigo-400 p-4">
      <Header onClick={fetchServicios} />
      <Image
        src="/LOGOTIPO_BANO.png"
        alt="Logo Baño"
        className='mb-10'
        style={{
          filter: "invert(50%) sepia(100%) saturate(500%) hue-rotate(180deg)"
        }}
        width={250}
        height={250}
      />

      <div className="text-4xl font-bold" style={{ color: "#013ba7" }}>
        Elija la opción según servicio, para imprimir Ticket.
      </div>

      <div className={`text-lg font-semibold text-white`}>
        {disabled ? 'Esperando al servidor' : 'Servidor listo'}
      </div>

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
              key={s.id ?? s._id}
              servicio={s.nombre}
              precio={s.precio}
              onClick={() => handleClick(s.precio)}
              disabled={disabled || loading} 
            />
          ))}
        </div>
      </div>

      <Footer />

      <Modal
        open={open}
        onClose={handleClose}
        title={
          <div className='flex justify-between w-full'>
            <span>Modal de pago</span>
            <p>Monto: {currentAmount}</p>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <div className='flex flex-col items-center justify-center gap-10' style={{ minHeight: "300px" }}>
              <svg className="animate-spin h-15 w-15 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p className="text-gray-700 text-2xl">Procesando pago, siga las instrucciones del equipo...</p>
            </div>
          ) : paymentResponse ? (
            <div className='flex flex-col justify-between w-full' style={{ minHeight: "300px" }}>
              {paymentResponse.data?.approved
                ? <div className='flex flex-col items-center justify-center'>
                  <CircleCheck size={80} color="green" className='mb-2' />
                  <h2 className=' text-3xl font-bold mb-10'>Pago Aprobado</h2>
                  <p className='text-2xl'>{paymentResponse.data?.rawData?.responseMessage}</p>
                </div>
                : <div className='flex flex-col items-center justify-center'>
                  <CircleX size={80} color="red" className='mb-2' />
                  <h2 className=' text-3xl font-bold mb-10'>Pago Fallido</h2>
                  <p className='text-2xl'>{paymentResponse.data?.rawData?.responseMessage}</p>
                </div>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-xl font-medium text-gray-700 active:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-between h-full w-full'>
              <p className='text-2xl py-10'>No hay respuesta de pago.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-xl font-medium text-gray-700 active:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}
