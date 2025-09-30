'use client';

import { useEffect, useState } from 'react';
import { CircleX, TriangleAlert, CircleCheck } from 'lucide-react';

import Header from '@/components/header/header';
import Card from '@/components/card/card';
import Footer from '@/components/footer/footer';
import Modal from '@/components/modal/modal';

import { serviciosService } from '@/lib/servicios.service';
import { paymentService } from '@/lib/payment.service';

export default function HomePage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [paymentResponse, setPaymentResponse] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setCurrentAmount(null);
    setPaymentResponse(null);
  };

  useEffect(() => {
    // cargar servicios
    let mounted = true;
    serviciosService.getServicios()
      .then(data => {
        if (!mounted) return;
        setServicios(data);
      })
      .catch(err => {
        console.error(err);
        setError(err?.message ?? 'Error al cargar servicios');
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchServicios = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await serviciosService.getServicios();
      setServicios(data);
    } catch (err) {
      setError(err?.message ?? 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  }

  const handleClick = async (amount) => {
    if (loading) return;
    setLoading(true);
    setCurrentAmount(amount);
    setPaymentResponse(null);
    setOpen(true);

    try {
      const ticketNumber = String(Date.now());

      const payload = { amount, ticketNumber };
      console.log('payload', payload);

      const result = await paymentService.postPayment(payload);
      console.log('payment result', result);

      setPaymentResponse(result);
    } catch (err) {
      console.error(err);
      setError(err?.message ?? 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 font-sans w-full min-h-screen relative bg-gradient-to-br from-blue-50 to-indigo-400 p-4">
      <Header onClick={() => { fetchServicios() }} />

      <div className="text-4xl font-bold" style={{ color: "#013ba7" }}>
        Elija la opción según servicio, para imprimir Ticket.
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

        <div className="flex flex-col items-center justify-center gap-6">
          {servicios.map(s => (
            <Card
              key={s.id ?? s._id}
              servicio={s.nombre}
              precio={s.precio}
              onClick={() => handleClick(s.precio)}
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
              <p className="text-gray-700 font-2xl">Procesando pago, siga las instrucciones del equipo...</p>
            </div>
          ) : paymentResponse ? (
            <div className='flex flex-col justify-center' style={{ minHeight: "300px" }}>
              {paymentResponse.data?.approved
                ? <div className='flex flex-col items-center justify-center'>
                  <CircleCheck size={80} color="green" className='mb-2' />
                  <h2 className=' text-3xl font-bold mb-10'>Pago Aprobado</h2>
                </div>
                : <div className='flex flex-col items-center justify-center'>
                  <CircleX size={80} color="red" className='mb-2' />
                  <h2 className=' text-3xl font-bold mb-10'>Pago Fallido</h2>
                </div>}

              <p className='text-2xl'>{paymentResponse.data?.rawData?.responseMessage}</p>
              <div className="flex justify-end gap-2 px-5 py-4 border-t shrink-0">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-center' style={{ minHeight: "300px" }}>
              <p className='text-2xl'>No hay respuesta de pago.</p>
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}
