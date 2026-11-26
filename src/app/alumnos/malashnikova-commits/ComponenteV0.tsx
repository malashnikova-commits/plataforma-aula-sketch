"use client";

import { useEffect, useRef, useState } from "react";
import {
  isMuted,
  playHoverTick,
  playLevelUp,
  playPop,
  playToggle,
  setMuted,
  startLoFiLoop,
  stopLoFiLoop,
  subscribeMuted,
} from "./sonidos";
import {
  BOTON_ACENTO,
  BOTON_CLARO,
  BOTON_OSCURO,
  ESTILO_CUADRICULA,
  ESTILO_LIBRETA,
  FISICA_TACTIL,
  FOCO_ACCESIBLE,
  PANEL_PRINCIPAL,
  RADIO_ORGANICO,
  SUBTARJETA,
} from "./temaSketch";

interface Tecnologia {
  id: string;
  emoji: string;
  nombre: string;
  nivel: number;
  tono: "sea" | "gold";
}

const TECHS_INICIALES: Tecnologia[] = [
  { id: "nextjs", emoji: "⚡", nombre: "Next.js", nivel: 80, tono: "sea" },
  { id: "tailwind", emoji: "🎨", nombre: "Tailwind", nivel: 90, tono: "gold" },
  { id: "ts", emoji: "🧩", nombre: "TypeScript", nivel: 70, tono: "sea" },
  { id: "ia", emoji: "🤖", nombre: "IA + Prompts", nivel: 90, tono: "gold" },
];

const ESTADOS = [
  { emoji: "✨", texto: "Creative" },
  { emoji: "☕", texto: "Con café" },
  { emoji: "🎧", texto: "En la zona" },
  { emoji: "🚀", texto: "Listo pal PR" },
];

const PISTAS = [
  { titulo: "Lo-Fi Sketchbook", acorde: "Cmaj7" },
  { titulo: "Midnight Deploy", acorde: "Dm9" },
  { titulo: "Pixel Coffee", acorde: "Fmaj7" },
];

export function ComponenteV0() {
  const [techs, setTechs] = useState<Tecnologia[]>(TECHS_INICIALES);
  const [estadoIdx, setEstadoIdx] = useState<number>(0);
  const [pistaIdx, setPistaIdx] = useState<number>(0);
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [silenciado, setSilenciado] = useState<boolean>(false);

  const [destelloMood, setDestelloMood] = useState<boolean>(false);
  const [toastCelebracion, setToastCelebracion] = useState<string | null>(null);
  const [mostrarAjustes, setMostrarAjustes] = useState<boolean>(false);
  const [modoCuadricula, setModoCuadricula] = useState<boolean>(false);
  const [animacionesExtra, setAnimacionesExtra] = useState<boolean>(true);

  const toastTimerRef = useRef<number | null>(null);
  const moodTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSilenciado(isMuted());
    const unsub = subscribeMuted((nuevoEstado) => setSilenciado(nuevoEstado));
    return () => {
      unsub();
      stopLoFiLoop();
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (moodTimerRef.current !== null) window.clearTimeout(moodTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (reproduciendo && !silenciado) {
      startLoFiLoop(pistaIdx);
    } else {
      stopLoFiLoop();
    }
    return () => stopLoFiLoop();
  }, [reproduciendo, pistaIdx, silenciado]);

  const estadoActual = ESTADOS[estadoIdx];
  const pistaActual = PISTAS[pistaIdx];

  const alternarSilencioGlobal = () => {
    if (silenciado) {
      setMuted(false);
      playToggle(true);
    } else {
      setMuted(true);
    }
  };

  const cambiarEstado = () => {
    playPop();
    setEstadoIdx((prev) => (prev + 1) % ESTADOS.length);
    setDestelloMood(true);
    if (moodTimerRef.current !== null) window.clearTimeout(moodTimerRef.current);
    moodTimerRef.current = window.setTimeout(() => setDestelloMood(false), 360);
  };

  const subirNivel = (techActual: Tecnologia) => {
    const siguiente = techActual.nivel >= 100 ? 10 : Math.min(100, techActual.nivel + 10);
    playLevelUp(siguiente);
    setTechs((prev) =>
      prev.map((item) => (item.id === techActual.id ? { ...item, nivel: siguiente } : item))
    );

    if (siguiente === 100) {
      setToastCelebracion(`${techActual.nombre} al 100%`);
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToastCelebracion(null), 2200);
    }
  };

  const cambiarPista = (direccion: -1 | 1) => {
    playPop();
    setPistaIdx((prev) => (prev + direccion + PISTAS.length) % PISTAS.length);
  };

  const alternarPlayPausa = () => {
    const siguiente = !reproduciendo;
    if (!siguiente) playToggle(false);
    setReproduciendo(siguiente);
  };

  return (
    <section
      aria-label="Mi stack y reproductor Lo-Fi"
      className={`${PANEL_PRINCIPAL} p-6 sm:p-7`}
      style={modoCuadricula ? ESTILO_CUADRICULA : ESTILO_LIBRETA}
    >
      {/* Cabecera minimalista */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#123850]/30 pb-4">
        <h2 className="text-xl font-black tracking-tight text-[#123850] sm:text-2xl">
          Mi stack &amp; vibes
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={cambiarEstado}
            onMouseEnter={playHoverTick}
            aria-label={`Estado: ${estadoActual.texto}. Cambiar`}
            className={`border-2 border-[#123850] px-3.5 py-1.5 text-xs font-black shadow-[3px_3px_0px_#123850] ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
              destelloMood ? "bg-[#D69A3F]/20 scale-105" : "bg-[#FEFEFA]"
            }`}
            style={RADIO_ORGANICO}
          >
            {estadoActual.emoji} {estadoActual.texto}
          </button>

          <button
            type="button"
            onClick={alternarSilencioGlobal}
            onMouseEnter={playHoverTick}
            aria-pressed={!silenciado}
            aria-label={silenciado ? "Activar sonido" : "Silenciar"}
            className={`px-3 py-1.5 font-mono text-xs font-black ${
              silenciado ? BOTON_CLARO : BOTON_ACENTO
            }`}
          >
            {silenciado ? "🔇 Silencio" : "🔊 Sonido"}
          </button>

          <button
            type="button"
            onClick={() => {
              const siguiente = !mostrarAjustes;
              playToggle(siguiente);
              setMostrarAjustes(siguiente);
            }}
            aria-expanded={mostrarAjustes}
            aria-label="Ajustes visuales de la tarjeta"
            className={`px-3 py-1.5 font-mono text-xs font-black ${
              mostrarAjustes ? BOTON_OSCURO : BOTON_CLARO
            }`}
          >
            ⚙️ Ajustes
          </button>
        </div>
      </header>

      {/* Panel contraíble de Ajustes (cerrado por defecto) */}
      {mostrarAjustes && (
        <div
          role="region"
          aria-label="Preferencias visuales"
          className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border-2 border-dashed border-[#123850]/30 bg-[#FEFEFA] p-3.5"
        >
          <button
            type="button"
            onClick={() => {
              const siguiente = !modoCuadricula;
              setModoCuadricula(siguiente);
              playToggle(siguiente);
            }}
            aria-pressed={modoCuadricula}
            className={`px-3 py-1.5 font-mono text-xs font-black ${
              modoCuadricula ? BOTON_ACENTO : BOTON_CLARO
            }`}
          >
            {modoCuadricula ? "📐 Cuadrícula" : "⠿ Puntos"}
          </button>

          <button
            type="button"
            onClick={() => {
              const siguiente = !animacionesExtra;
              setAnimacionesExtra(siguiente);
              playToggle(siguiente);
            }}
            aria-pressed={animacionesExtra}
            className={`px-3 py-1.5 font-mono text-xs font-black ${
              animacionesExtra ? BOTON_ACENTO : BOTON_CLARO
            }`}
          >
            {animacionesExtra ? "✨ Movimiento ON" : "⏸ Movimiento OFF"}
          </button>
        </div>
      )}

      {/* Feedback discreto al alcanzar 100% */}
      {toastCelebracion && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3.5 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850]"
        >
          <span>🎉 {toastCelebracion}</span>
        </div>
      )}

      {/* Cuadrícula 2x2 limpia */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {techs.map((tech) => {
          const esGold = tech.tono === "gold";
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => subirNivel(tech)}
              onMouseEnter={playHoverTick}
              aria-label={`${tech.nombre}: ${tech.nivel}%`}
              className={`${SUBTARJETA} ${FISICA_TACTIL} ${FOCO_ACCESIBLE} group flex flex-col gap-3 p-4 text-left`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#123850] bg-[#D69A3F]/20 text-lg transition-transform motion-reduce:transition-none ${
                      animacionesExtra ? "group-hover:rotate-6" : ""
                    }`}
                  >
                    {tech.emoji}
                  </span>
                  <span className="text-base font-black text-[#123850]">{tech.nombre}</span>
                </div>

                <span
                  className={`rounded-lg border-2 border-[#123850] px-2 py-0.5 font-mono text-xs font-black ${
                    tech.nivel === 100
                      ? "bg-[#D69A3F] text-[#123850]"
                      : "bg-[#FEFEFA] text-[#123850]"
                  }`}
                >
                  {tech.nivel}%
                </span>
              </div>

              <div
                className="h-3.5 w-full overflow-hidden rounded-full border-2 border-[#123850] bg-[#123850]/10 p-0.5"
                role="progressbar"
                aria-valuenow={tech.nivel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Nivel de ${tech.nombre}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out motion-reduce:transition-none ${
                    esGold ? "bg-[#D69A3F]" : "bg-[#123850]"
                  }`}
                  style={{ width: `${tech.nivel}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini reproductor sobrio */}
      <div className={`${SUBTARJETA} flex flex-wrap items-center justify-between gap-4 p-4`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cambiarPista(-1)}
            onMouseEnter={playHoverTick}
            aria-label="Pista anterior"
            className={`flex h-9 w-9 items-center justify-center font-mono text-xs font-black ${BOTON_CLARO}`}
          >
            ⏮
          </button>

          <button
            type="button"
            onClick={alternarPlayPausa}
            onMouseEnter={playHoverTick}
            aria-pressed={reproduciendo}
            aria-label={reproduciendo ? "Pausar audio" : "Reproducir audio"}
            className={`px-4 py-1.5 font-mono text-xs font-black ${
              reproduciendo ? BOTON_ACENTO : BOTON_OSCURO
            }`}
          >
            {reproduciendo ? "⏸ Pausa" : "▶ Play"}
          </button>

          <button
            type="button"
            onClick={() => cambiarPista(1)}
            onMouseEnter={playHoverTick}
            aria-label="Siguiente pista"
            className={`flex h-9 w-9 items-center justify-center font-mono text-xs font-black ${BOTON_CLARO}`}
          >
            ⏭
          </button>
        </div>

        <div className="flex flex-1 items-center justify-between gap-3">
          <p className="font-mono text-xs font-black text-[#123850] sm:text-sm">
            {pistaActual.titulo}{" "}
            <span className="font-bold text-[#123850]/70">· {pistaActual.acorde}</span>
          </p>

          <div
            aria-label={reproduciendo && !silenciado ? "Reproduciendo" : "En pausa"}
            className="flex h-5 items-end gap-1"
          >
            {[10, 16, 12, 18].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full border border-[#123850] transition-all motion-reduce:animate-none ${
                  reproduciendo && !silenciado && animacionesExtra
                    ? "animate-pulse bg-[#D69A3F]"
                    : "bg-[#123850]/10"
                }`}
                style={{
                  height: reproduciendo && !silenciado ? `${h}px` : "6px",
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
