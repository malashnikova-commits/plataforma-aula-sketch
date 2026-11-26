import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlumno } from "@/lib/alumnos";
import { ComponenteV0 } from "./ComponenteV0";
import { Reacciones } from "./Reacciones";
import { AulaInteractiva } from "./aula/AulaInteractiva";
import { EstudioAlumno } from "./EstudioAlumno";
import { BOTON_CLARO, ESTILO_LIBRETA, PANEL_PRINCIPAL } from "./temaSketch";

const USUARIO = "malashnikova-commits";

export default function PaginaAlumno() {
  const alumno = getAlumno(USUARIO);
  if (!alumno) notFound();

  return (
    <div
      className="min-h-screen bg-[#FEFEFA] text-[#123850] selection:bg-[#D69A3F]/20"
      style={ESTILO_LIBRETA}
    >
      <main id="contenido-principal" className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-4 py-1.5 font-mono text-xs font-black ${BOTON_CLARO}`}
        >
          ← Muro
        </Link>

        {/* Cabecera limpia de perfil (conserva RETO 2.1, 2.2 y 2.3) */}
        <header
          className={`${PANEL_PRINCIPAL} mt-6 flex flex-col gap-5 p-6 transition hover:scale-[1.02] motion-reduce:transition-none md:flex-row md:items-center`}
        >
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border-[2.5px] border-dashed border-[#123850] bg-[#D69A3F]/20">
            <span className="text-4xl">{alumno.emoji}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-[#123850] sm:text-3xl">
                {alumno.nombre}
              </h1>
              <span className="rounded-lg border-2 border-[#123850] bg-[#FEFEFA] px-2 py-0.5 font-mono text-xs font-bold text-[#123850]/70">
                @{alumno.usuario}
              </span>
            </div>

            <p className="text-sm font-semibold leading-relaxed text-[#123850]/70 sm:text-base">
              “{alumno.frase}”
            </p>
          </div>
        </header>

        {/* Workspace limpio con revelación progresiva y un solo foco activo */}
        <EstudioAlumno
          aulaSlot={<AulaInteractiva />}
          stackSlot={<ComponenteV0 />}
          reaccionesSlot={<Reacciones />}
          aprendizajesSlot={
            <ul className="list-disc space-y-2 pl-5 text-sm font-semibold text-[#123850] marker:text-[#D69A3F]">
              <li>
                Ejecutar scripts de Node.js fuera del navegador para automatizar archivos del
                proyecto.
              </li>
              <li>
                Distinguir rutas App Router, Server Components y Client Components en Next.js.
              </li>
              <li>
                Aplicar un sistema de diseño minimalista y accesible con clases literales de
                Tailwind CSS.
              </li>
            </ul>
          }
        />
      </main>
    </div>
  );
}
