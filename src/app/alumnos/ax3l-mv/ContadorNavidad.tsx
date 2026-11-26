"use client";

import { useState, useEffect } from "react";

export function ContadorNavidad() {
  const [diasRestantes, setDiasRestantes] = useState(0);

  useEffect(() => {
    const calcularDias = () => {
      const hoy = new Date();
      const navidad = new Date(hoy.getFullYear(), 11, 25);
      if (hoy > navidad) {
        navidad.setFullYear(hoy.getFullYear() + 1);
      }
      const diffTime = navidad.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDiasRestantes(diffDays);
    };

    calcularDias();
    const interval = setInterval(calcularDias, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 p-6 rounded-2xl bg-white border-4 border-red-600 shadow-lg text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl" aria-hidden="true">🎄</span>
        <h2 className="text-2xl font-bold text-red-700">¡Cuenta atrás para Navidad!</h2>
        <div className="text-6xl font-bold text-red-600 font-mono">{diasRestantes}</div>
        <p className="text-lg text-red-800">
          {diasRestantes === 1 ? "día" : "días"} restantes
        </p>
        <span className="text-3xl" aria-hidden="true">❄️</span>
      </div>
      <div className="mt-4 flex justify-center gap-4 text-2xl" aria-hidden="true">
        <span>🎅</span>
        <span>🎁</span>
        <span>🦌</span>
        <span>⭐</span>
      </div>
    </div>
  );
}