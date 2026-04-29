"use client";

import { useState } from "react";
import { getTotemConfig } from "@/services/totem.service";
import DotsLoader from "../loader/dots-loader";

export default function TotemConfig({ onSuccess }) {
  const [totemId, setTotemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totemId) {
      setError("Por favor ingrese un ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const config = await getTotemConfig(totemId);
      if (config && config.ip) {
        localStorage.setItem("ip", config.ip);
        localStorage.setItem("site", config.ubicacion);
        localStorage.setItem("totemId", totemId);
        onSuccess();
      } else {
        throw new Error("No se obtuvo configuración válida");
      }
    } catch (err) {
      setError("ID de Tótem inválido o error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#013ba7] px-4">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-16 rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-4xl font-bold text-[#013ba7]">WIT</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-6xl font-black text-white tracking-tight">
              Configuración
            </h2>
            <p className="text-2xl text-blue-100/80 font-medium">
              Ingrese el identificador único del punto de acceso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-8 mt-4">
            <div className="relative group">
              <input
                type="number"
                value={totemId}
                onChange={(e) => setTotemId(e.target.value)}
                placeholder="Ej: 1001"
                disabled={loading}
                className="w-full bg-white/5 border-2 border-white/10 text-white text-5xl py-8 px-10 rounded-3xl outline-none focus:border-white/40 transition-all duration-300 placeholder:text-white/20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
              <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {error && (
              <div className="text-red-300 text-2xl font-bold animate-bounce bg-red-500/20 py-4 px-6 rounded-2xl border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !totemId}
              className="w-full bg-white text-[#013ba7] text-4xl font-black py-8 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <span>Validando</span>
                  <DotsLoader />
                </div>
              ) : (
                <>
                  <span>Iniciar Aplicación</span>
                  <svg 
                    className="w-10 h-10 group-hover:translate-x-2 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-xl text-white/40 font-semibold pt-4">
            v1.2.0 • Wit Software Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
