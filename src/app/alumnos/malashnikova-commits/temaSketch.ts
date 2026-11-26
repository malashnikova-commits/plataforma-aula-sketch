import type { CSSProperties } from "react";

// Sistema de diseño base permanente: paleta estricta de 3 colores
// Baby Powder (#FEFEFA) · Gibraltar Sea (#123850) · Gold Coast (#D69A3F)

export const ESTILO_LIBRETA: CSSProperties = {
  backgroundImage: "radial-gradient(#12385016 1.1px, transparent 1.1px)",
  backgroundSize: "20px 20px",
};

export const ESTILO_CUADRICULA: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(18,56,80,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,56,80,0.08) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

export const RADIO_ORGANICO: CSSProperties = {
  borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
};

export const PANEL_PRINCIPAL =
  "rounded-3xl border-[3px] border-[#123850] bg-[#FEFEFA] text-[#123850] shadow-[6px_6px_0px_#123850]";

export const SUBTARJETA =
  "rounded-2xl border-[2.5px] border-[#123850] bg-[#FEFEFA] text-[#123850] shadow-[4px_4px_0px_#123850]";

export const FOCO_ACCESIBLE =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D69A3F]";

export const FISICA_TACTIL =
  "cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none motion-reduce:animate-none";

export const BOTON_BASE = `rounded-xl border-2 border-[#123850] shadow-[3px_3px_0px_#123850] ${FISICA_TACTIL} ${FOCO_ACCESIBLE}`;

export const BOTON_CLARO = `${BOTON_BASE} bg-[#FEFEFA] text-[#123850]`;

export const BOTON_ACENTO = `${BOTON_BASE} bg-[#D69A3F] text-[#123850]`;

export const BOTON_OSCURO = `${BOTON_BASE} bg-[#123850] text-[#FEFEFA]`;

export const INPUT_BASE = `rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 text-sm font-bold text-[#123850] placeholder:text-[#123850]/70 ${FOCO_ACCESIBLE}`;
