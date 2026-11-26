"use client";

import { useState } from "react";
import { playHoverTick, playPop, playToggle } from "./sonidos";
import { FISICA_TACTIL, FOCO_ACCESIBLE, PANEL_PRINCIPAL } from "./temaSketch";

interface Reaccion {
  id: string;
  emoji: string;
  etiqueta: string;
  votos: number;
}

const REACCIONES_INICIALES: Reaccion[] = [
  { id: "alien", emoji: "👽", etiqueta: "Genial", votos: 3 },
  { id: "fuego", emoji: "🔥", etiqueta: "Flow", votos: 5 },
  { id: "flor", emoji: "🌼", etiqueta: "Vibra", votos: 4 },
];

export function Reacciones() {
  const [reacciones, setReacciones] = useState<Reaccion[]>(REACCIONES_INICIALES);
  const [modoOscuro, setModoOscuro] = useState<boolean>(false);
  const [ultima, setUltima] = useState<string | null>(null);

  const sumar = (id: string) => {
    playPop();
    setReacciones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, votos: item.votos + 1 } : item))
    );
    setUltima(id);
  };

  const alternarTema = () => {
    const siguiente = !modoOscuro;
    setModoOscuro(siguiente);
    playToggle(siguiente);
  };

  const total = reacciones.reduce((acc, r) => acc + r.votos, 0);

  return (
    <section
      aria-label="Reacciones"
      className={`rounded-3xl border-[3px] p-6 transition-colors motion-reduce:transition-none ${
        modoOscuro
          ? "border-[#123850] bg-[#123850] text-[#FEFEFA] shadow-[6px_6px_0px_#D69A3F]"
          : PANEL_PRINCIPAL
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#123850]/30 pb-4">
        <h2 className="text-xl font-black tracking-tight">Reacciones ({total})</h2>

        <button
          type="button"
          onClick={alternarTema}
          onMouseEnter={playHoverTick}
          aria-pressed={modoOscuro}
          className={`rounded-xl border-2 px-3.5 py-1.5 font-mono text-xs font-black ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
            modoOscuro
              ? "border-[#FEFEFA] bg-[#FEFEFA] text-[#123850] shadow-[3px_3px_0px_#D69A3F]"
              : "border-[#123850] bg-[#123850] text-[#FEFEFA] shadow-[3px_3px_0px_#123850]"
          }`}
        >
          {modoOscuro ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {reacciones.map((item) => {
          const activa = ultima === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => sumar(item.id)}
              onMouseEnter={playHoverTick}
              aria-label={`${item.etiqueta}: ${item.votos}`}
              className={`group flex items-center justify-between rounded-2xl border-[2.5px] px-4 py-3 text-left ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
                modoOscuro
                  ? activa
                    ? "border-[#D69A3F] bg-[#D69A3F]/20 text-[#FEFEFA] shadow-[4px_4px_0px_#D69A3F]"
                    : "border-[#FEFEFA] bg-[#123850] text-[#FEFEFA] shadow-[4px_4px_0px_#D69A3F]"
                  : activa
                    ? "border-[#123850] bg-[#D69A3F]/20 text-[#123850] shadow-[4px_4px_0px_#123850]"
                    : "border-[#123850] bg-[#FEFEFA] text-[#123850] shadow-[4px_4px_0px_#123850]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl transition-transform group-hover:scale-110 motion-reduce:transition-none">
                  {item.emoji}
                </span>
                <span className="text-sm font-black">{item.etiqueta}</span>
              </div>

              <span className="rounded-lg border-2 border-[#123850] bg-[#D69A3F] px-2.5 py-0.5 font-mono text-xs font-black text-[#123850]">
                {item.votos}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
