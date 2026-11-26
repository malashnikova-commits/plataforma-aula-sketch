import Link from "next/link";
import { type Alumno, misionesCompletadas, TOTAL_MISIONES } from "@/lib/alumno-tipos";

export function TarjetaAlumno({ alumno }: { alumno: Alumno }) {
  const hechas = misionesCompletadas(alumno);
  const porcentaje = Math.round((hechas / TOTAL_MISIONES) * 100);

  return (
    <Link
      href={`/alumnos/${alumno.usuario}`}
      className="group relative flex flex-col gap-3 rounded-2xl border-[2.5px] border-[#123850] bg-[#FEFEFA] p-5 text-[#123850] shadow-[4px_4px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#123850] bg-[#D69A3F]/20 text-2xl">
            {alumno.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate font-black leading-tight text-[#123850]">{alumno.nombre}</p>
            <p className="truncate font-mono text-xs font-bold text-[#123850]/70">
              @{alumno.usuario}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border-2 border-[#123850] bg-[#D69A3F] px-2 py-0.5 font-mono text-xs font-black text-[#123850]">
          {hechas}/{TOTAL_MISIONES}
        </span>
      </div>

      <p className="text-sm font-medium text-[#123850]/70">“{alumno.frase}”</p>

      <div className="mt-auto">
        <div
          className="h-3 overflow-hidden rounded-full border-2 border-[#123850] bg-[#123850]/10 p-0.5"
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Avance de ${alumno.nombre}`}
        >
          <div
            className="h-full rounded-full bg-[#D69A3F] transition-all duration-300 ease-out"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
