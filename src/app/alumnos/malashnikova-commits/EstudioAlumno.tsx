"use client";

import { useState, type ReactNode } from "react";
import { playPop, playToggle } from "./sonidos";
import {
  BOTON_ACENTO,
  BOTON_CLARO,
  FOCO_ACCESIBLE,
  SUBTARJETA,
} from "./temaSketch";

type ModuloVista = "aula" | "stack" | "reacciones";

interface EstudioAlumnoProps {
  aulaSlot: ReactNode;
  stackSlot: ReactNode;
  reaccionesSlot: ReactNode;
  aprendizajesSlot: ReactNode;
}

export function EstudioAlumno({
  aulaSlot,
  stackSlot,
  reaccionesSlot,
  aprendizajesSlot,
}: EstudioAlumnoProps) {
  const [moduloActivo, setModuloActivo] = useState<ModuloVista>("aula");
  const [mostrarAprendizajes, setMostrarAprendizajes] = useState<boolean>(false);

  const cambiarModulo = (nuevo: ModuloVista) => {
    playPop();
    setModuloActivo(nuevo);
  };

  const alternarAprendizajes = () => {
    const siguiente = !mostrarAprendizajes;
    playToggle(siguiente);
    setMostrarAprendizajes(siguiente);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Acordeón contraíble: Lo que aprendí hoy (RETO 2.4 conservado y limpio) */}
      <section className={`${SUBTARJETA} overflow-hidden`}>
        <button
          type="button"
          onClick={alternarAprendizajes}
          aria-expanded={mostrarAprendizajes}
          className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left ${FOCO_ACCESIBLE}`}
        >
          <span className="text-base font-black text-[#123850]">
            ✏️ Lo que aprendí hoy
          </span>
          <span className="font-mono text-xs font-black text-[#123850]/70">
            {mostrarAprendizajes ? "Ocultar ▲" : "Ver notas ▼"}
          </span>
        </button>

        {mostrarAprendizajes && (
          <div className="border-t-2 border-dashed border-[#123850]/30 px-5 py-4">
            {aprendizajesSlot}
          </div>
        )}
      </section>

      {/* Selector limpio de módulo principal: un solo foco activo a la vez */}
      <nav
        aria-label="Módulos interactivos de mi libreta"
        className="flex flex-wrap items-center gap-2.5"
      >
        {(
          [
            { id: "aula", etiqueta: "🗺️ Aula" },
            { id: "stack", etiqueta: "🎛️ Stack y Audio" },
            { id: "reacciones", etiqueta: "💬 Reacciones" },
          ] as { id: ModuloVista; etiqueta: string }[]
        ).map((item) => {
          const activo = moduloActivo === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => cambiarModulo(item.id)}
              aria-pressed={activo}
              className={`px-4 py-2 font-mono text-xs font-black sm:text-sm ${
                activo ? BOTON_ACENTO : BOTON_CLARO
              }`}
            >
              {item.etiqueta}
            </button>
          );
        })}
      </nav>

      {/* Foco único activo */}
      <div>
        {moduloActivo === "aula" && aulaSlot}
        {moduloActivo === "stack" && stackSlot}
        {moduloActivo === "reacciones" && reaccionesSlot}
      </div>
    </div>
  );
}
