"use client";

import { useState } from "react";

export function Reacciones() {
  const [counts, setCounts] = useState<Record<string, number>>({
    "👍": 0,
    "❤️": 0,
    "😂": 0,
  });

  const increment = (emoji: string) => {
    setCounts((prev) => ({ ...prev, [emoji]: prev[emoji] + 1 }));
  };

  const emojis = ["👍", "❤️", "😂"] as const;

  return (
    <div className="flex gap-4 mt-6">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => increment(emoji)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-borde bg-panel hover:bg-borde transition"
        >
          <span className="text-2xl">{emoji}</span>
          <span className="font-mono text-sm">{counts[emoji]}</span>
        </button>
      ))}
    </div>
  );
}