"use client";

import { useEffect, useRef, useState } from "react";
import { playPop, playToggle } from "@/lib/sonidosGlobal";
import { esEntornoLocalNavegador } from "@/lib/storage/powershellBridge";
import { supabaseConfigurado } from "@/lib/supabase";

export function CompartirEnlace() {
  const [abierto, setAbierto] = useState(false);
  const [urlActual, setUrlActual] = useState("");
  const [esLocal, setEsLocal] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nubeActiva = supabaseConfigurado();

  useEffect(() => {
    setUrlActual(window.location.href);
    setEsLocal(esEntornoLocalNavegador());
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const manejarClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", manejarClickFuera);
    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, [abierto]);

  const copiarUrl = async () => {
    if (!urlActual) return;
    try {
      await navigator.clipboard.writeText(urlActual);
    } catch {
      inputRef.current?.select();
    }
    playPop();
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => {
          const sig = !abierto;
          playToggle(sig);
          setAbierto(sig);
        }}
        className={`cursor-pointer rounded-xl border-2 border-[#123850] px-2.5 py-1 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
          abierto ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
        }`}
      >
        🔗 Compartir
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Compartir enlace de la plataforma"
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border-2 border-[#123850] bg-[#FEFEFA] p-3.5 shadow-[4px_4px_0px_#123850] sm:w-80"
        >
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1.5">
            <span className="rounded-lg border border-[#123850] bg-[#D69A3F]/20 px-2 py-0.5 font-mono text-[11px] font-black text-[#123850]">
              {esLocal ? "Local (localhost)" : "Enlace público"}
            </span>
            <span className="rounded-lg border border-[#123850]/30 bg-[#FEFEFA] px-2 py-0.5 font-mono text-[11px] font-bold text-[#123850]/70">
              {nubeActiva ? "Nube activa" : "Solo navegador"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={urlActual}
              aria-label="URL actual"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-2.5 py-1.5 font-mono text-xs font-bold text-[#123850]"
            />
            <button
              type="button"
              onClick={() => void copiarUrl()}
              className="shrink-0 cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {copiado ? "Copiado ✓" : "Copiar enlace"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
