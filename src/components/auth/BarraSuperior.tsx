"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { CompartirEnlace } from "@/components/sketch/CompartirEnlace";
import { SoundControl } from "@/components/sketch/SoundControl";
import { playToggle } from "@/lib/sonidosGlobal";

const NOMBRE_APP = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "~/plataforma-aula";

export function BarraSuperior() {
  const { usuario, hidratado, estadoGuardado, cerrarSesion } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b-2 border-dashed border-[#123850]/30 bg-[#FEFEFA]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:text-sm"
          >
            {NOMBRE_APP}
          </Link>

          <Link
            href="/supabase"
            className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-2.5 py-1 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Supabase
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hidratado && usuario && (
            <>
              {estadoGuardado !== "inactivo" && (
                <span className="rounded-lg border border-[#123850]/30 bg-[#FEFEFA] px-2 py-0.5 font-mono text-[11px] font-bold text-[#123850]/70">
                  {estadoGuardado === "guardando"
                    ? "Guardando…"
                    : estadoGuardado === "guardado"
                      ? "Guardado ✓"
                      : "Error al guardar"}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#123850] bg-[#D69A3F]/20 px-2.5 py-1 font-mono text-xs font-black text-[#123850]">
                <span>{usuario.avatar}</span>
                <span>{usuario.alias}</span>
                <span className="rounded bg-[#D69A3F] px-1.5 py-0.2 text-[10px] uppercase">
                  {usuario.rol === "tutor" ? "Tutor" : "Alumnado"}
                </span>
              </span>

              <button
                type="button"
                onClick={() => {
                  playToggle(false);
                  void cerrarSesion();
                }}
                className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#123850] px-3 py-1 font-mono text-xs font-black text-[#FEFEFA] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Salir
              </button>
            </>
          )}

          <CompartirEnlace />
          <SoundControl />
        </div>
      </nav>
    </header>
  );
}
