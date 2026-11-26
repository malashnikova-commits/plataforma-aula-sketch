"use client";

import { useEffect, useState } from "react";
import {
  isGlobalMuted,
  playToggle,
  subscribeGlobalMuted,
  toggleGlobalMuted,
} from "@/lib/sonidosGlobal";

export function SoundControl() {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(isGlobalMuted());
    return subscribeGlobalMuted(setMuted);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = toggleGlobalMuted();
        if (!next) playToggle(true);
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      className={`cursor-pointer rounded-xl border-2 border-[#123850] px-2.5 py-1 font-mono text-xs font-black shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none ${
        muted ? "bg-[#FEFEFA] text-[#123850]" : "bg-[#D69A3F] text-[#123850]"
      }`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
