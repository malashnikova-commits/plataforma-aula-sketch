"use client";

import { useState, type ReactNode } from "react";
import { playToggle } from "@/lib/sonidosGlobal";

interface SketchCardProps {
  children: ReactNode;
  variant?: "principal" | "subtarjeta";
  collapsible?: boolean;
  defaultOpen?: boolean;
  title?: string;
  summaryRight?: ReactNode;
  className?: string;
}

export function SketchCard({
  children,
  variant = "subtarjeta",
  collapsible = false,
  defaultOpen = false,
  title,
  summaryRight,
  className = "",
}: SketchCardProps) {
  const [abierto, setAbierto] = useState<boolean>(defaultOpen);

  const marco =
    variant === "principal"
      ? "rounded-3xl border-[3px] border-[#123850] bg-[#FEFEFA] text-[#123850] shadow-[6px_6px_0px_#123850]"
      : "rounded-2xl border-[2.5px] border-[#123850] bg-[#FEFEFA] text-[#123850] shadow-[4px_4px_0px_#123850]";

  if (!collapsible) {
    return <div className={`${marco} ${className}`}>{children}</div>;
  }

  return (
    <div className={`${marco} overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => {
          const sig = !abierto;
          playToggle(sig);
          setAbierto(sig);
        }}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#D69A3F]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D69A3F] motion-reduce:transition-none"
      >
        <span className="text-sm font-black text-[#123850] sm:text-base">{title}</span>
        <span className="flex items-center gap-2.5 font-mono text-xs font-black text-[#123850]/70">
          {summaryRight}
          <span>{abierto ? "▲" : "▼"}</span>
        </span>
      </button>

      {abierto && (
        <div className="border-t-2 border-dashed border-[#123850]/30 p-5">{children}</div>
      )}
    </div>
  );
}
