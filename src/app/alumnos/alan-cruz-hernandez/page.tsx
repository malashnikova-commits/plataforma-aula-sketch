import Link from "next/link";
import { notFound } from "next/navigation";
import { DoodleDivider } from "@/components/sketch/DoodleDivider";
import { SketchCard } from "@/components/sketch/SketchCard";
import { UnitCircleBadge } from "@/components/sketch/UnitCircleBadge";
import { getAlumno } from "@/lib/alumnos";
import { PanelAlanCruz } from "./PanelAlanCruz";

const USUARIO = "alan-cruz-hernandez";

export default function PaginaAlanCruz() {
  const alumno = getAlumno(USUARIO);
  if (!alumno) notFound();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-4 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        ← Volver a la plataforma
      </Link>

      <SketchCard variant="principal" className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#123850] bg-[#D69A3F]/20 text-3xl">
              {alumno.emoji}
            </span>
            <div>
              <h1 className="text-2xl font-black text-[#123850] sm:text-3xl">{alumno.nombre}</h1>
              <p className="font-mono text-xs font-bold text-[#123850]/70">@{alumno.usuario}</p>
            </div>
          </div>

          <UnitCircleBadge grados={360} size={54} label="5/5" />
        </div>

        <p className="mt-4 text-sm font-medium text-[#123850]/70 sm:text-base">“{alumno.frase}”</p>
      </SketchCard>

      <DoodleDivider />

      <PanelAlanCruz promptFavorito={alumno.promptFavorito} />
    </main>
  );
}
