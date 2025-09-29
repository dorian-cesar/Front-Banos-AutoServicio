'use client';

import { useEffect, useState } from 'react';

import Header from '@/components/header/header';
import Card from '@/components/card/card';
import Footer from '@/components/footer/footer';

import { serviciosService } from '@/lib/servicios.service';

export default function HomePage() {

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    serviciosService.getServicios()
      .then(data => {
        setServicios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleClick = (servicio) => {
    alert(`Card seleccionada: ${servicio}`);
  }


  if (loading) {
    return <div className="p-4">Cargando servicios...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-30 font-sans w-full min-h-screen relative bg-gradient-to-br from-blue-50 to-indigo-400 p-4">
      <Header />

      <div className="text-4xl font-bold" style={{ color: "#013ba7" }}>Elija la opción según servicio, para imprimir Ticket.</div>

      <div className="flex flex-col items-center justify-center gap-20">
        {servicios.map(s => (
          <Card
            key={s.id}
            servicio={s.nombre}
            precio={s.precio}
            onClick={() => handleClick(s.nombre)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}
