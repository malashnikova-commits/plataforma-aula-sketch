"use client";

import { useEffect, useState } from "react";

const FECHA_FIN = Date.UTC(2026, 10, 27);
const MILISEGUNDOS_POR_DIA = 86_400_000;

export function Contador() {
  const [dias, setDias] = useState<number | null>(null);

  useEffect(() => {
    const actualizar = () => {
      const hoy = new Date();
      const inicioHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      setDias(Math.max(0, Math.round((FECHA_FIN - inicioHoy) / MILISEGUNDOS_POR_DIA)));
    };

    actualizar();
    const intervalo = window.setInterval(actualizar, 60_000);

    return () => window.clearInterval(intervalo);
  }, []);

  return (
    <div className="rounded-2xl border border-borde bg-panel p-6">
      <p className="font-mono text-sm text-tenue">Días para mi último día de clases</p>
      <p className="mt-2 text-4xl font-bold text-papel">
        {dias ?? "—"} <span className="text-lg font-normal text-tenue">días</span>
      </p>
    </div>
  );
}
