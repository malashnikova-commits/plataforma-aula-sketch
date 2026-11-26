"use client";

import { useState } from "react";

interface Reaccion {
  emoji: string;
  label: string;
}

const REACCIONES_INICIALES: Reaccion[] = [
  { emoji: "🩷", label: "Me encanta" },
  { emoji: "🔥", label: "Fuego" },
  { emoji: "🚀", label: "Cohete" },
];

export function Reacciones() {
  // Estado para registrar el conteo de clics por cada emoji
  const [conteos, setConteos] = useState<Record<string, number>>({
    "🩷": 0,
    "🔥": 0,
    "🚀": 0,
  });

  const incrementar = (emoji: string) => {
    setConteos((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] ?? 0) + 1,
    }));
  };

  return (
    <div className="rounded-2xl border border-borde bg-panel p-6">
      <h3 className="text-lg font-semibold text-papel">Reacciones</h3>
      <p className="mt-1 text-sm text-tenue">Haz clic en los emojis para reaccionar:</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {REACCIONES_INICIALES.map(({ emoji, label }) => (
          <button
            key={emoji}
            type="button"
            onClick={() => incrementar(emoji)}
            aria-label={`Reaccionar con ${label}`}
            className="flex items-center gap-2 rounded-xl border border-borde bg-tinta px-4 py-2 font-mono text-sm transition hover:scale-105 hover:border-acento active:scale-95 cursor-pointer"
          >
            <span className="text-xl">{emoji}</span>
            <span className="font-bold text-papel">{conteos[emoji]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
