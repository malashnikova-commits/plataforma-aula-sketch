"use client";

import { useState } from "react";
import { SketchCard } from "@/components/sketch/SketchCard";
import { playPop } from "@/lib/sonidosGlobal";

const MISIONES_LISTA = [
  { id: "node", titulo: "Node.js fuera del navegador" },
  { id: "nextTailwind", titulo: "Next.js + Tailwind Sketch" },
  { id: "v0", titulo: "Diseño asistido con v0" },
  { id: "opencode", titulo: "OpenCode + flujo de agente" },
  { id: "supabase", titulo: "Supabase MCP" },
];

export function PanelAlanCruz({ promptFavorito }: { promptFavorito: string }) {
  const [reacciones, setReacciones] = useState({
    cohete: 0,
    chispa: 0,
    idea: 0,
  });

  const sumarReaccion = (clave: keyof typeof reacciones) => {
    playPop();
    setReacciones((prev) => ({ ...prev, [clave]: prev[clave] + 1 }));
  };

  return (
    <div className="space-y-5">
      <SketchCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs font-black uppercase text-[#123850]">
            Reacciones rápidas
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => sumarReaccion("cohete")}
              className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              🚀 {reacciones.cohete}
            </button>
            <button
              type="button"
              onClick={() => sumarReaccion("chispa")}
              className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F]/20 px-3 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              ✨ {reacciones.chispa}
            </button>
            <button
              type="button"
              onClick={() => sumarReaccion("idea")}
              className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              💡 {reacciones.idea}
            </button>
          </div>
        </div>
      </SketchCard>

      <SketchCard collapsible defaultOpen title="Misiones completadas (5/5)">
        <ul className="space-y-2">
          {MISIONES_LISTA.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3.5 py-2 text-sm font-bold text-[#123850]"
            >
              <span>{m.titulo}</span>
              <span className="rounded-lg border border-[#123850] bg-[#D69A3F] px-2 py-0.5 font-mono text-[11px] font-black text-[#123850]">
                ✓
              </span>
            </li>
          ))}
        </ul>
      </SketchCard>

      <SketchCard collapsible title="Apuntes del taller">
        <p className="font-mono text-xs font-bold leading-relaxed text-[#123850]/70">
          {promptFavorito}
        </p>
      </SketchCard>
    </div>
  );
}
