import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlumno } from "@/lib/alumnos";
import { ComponenteV0 } from "./ComponenteV0";
import { Reacciones } from "./Reacciones";
import { Contador } from "./Contador";

const USUARIO = "franciscamolinasarmientos";

export default function PaginaAlumno() {
  const alumno = getAlumno(USUARIO);
  if (!alumno) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="font-mono text-sm text-tenue hover:text-acento">
        ← volver al muro
      </Link>

      {/* ───────── MISIÓN 2 · Next.js + Tailwind ─────────
          RETO 2.1  Haz que el encabezado se vea en fila en pantallas medianas:
                    agrega "md:flex-row md:items-center" al div de abajo.
          RETO 2.2  Cambia "rounded-2xl" por "rounded-none" y luego por "rounded-full". ¿Qué pasa?
          RETO 2.3  Agrega un efecto al pasar el mouse a la tarjeta: "hover:scale-[1.02] transition".
      */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-borde bg-panel p-6 md:flex-row md:items-center transition hover:scale-[1.02]">
        <span className="text-6xl">{alumno.emoji}</span>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: alumno.color }}>
            {alumno.nombre}
          </h1>
          <p className="font-mono text-sm text-tenue">@{alumno.usuario}</p>
        </div>
      </div>

      <p className="mt-6 text-lg text-tenue">“{alumno.frase}”</p>

      {/* RETO 2.4  Crea aquí una sección "Lo que aprendí hoy" con una lista <ul> de 3 cosas.
                    Usa: space-y-2, list-disc, pl-5. */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Lo que aprendí hoy</h2>
        <ul className="mt-4 space-y-2 list-disc pl-5">
          <li>Clonar y configurar un proyecto con Git</li>
          <li>Usar Tailwind para cambiar el diseño según el tamaño de la pantalla</li>
          <li>Agregar efectos al pasar el mouse con hover</li>
        </ul>
      </section>

      {/* ───────── MISIÓN 3 · v0 ─────────
          Pega el componente que generaste en v0 dentro de ComponenteV0.tsx (misma carpeta). */}
      <section className="mt-10">
        <ComponenteV0 />
      </section>

      {/* ───────── MISIÓN 4 · OpenCode + NVIDIA ─────────
          Pídele a OpenCode que cree un componente y lo agregue debajo de este comentario.
          Ejemplo de prompt en el README. */}
      <section className="mt-10">
        <Reacciones />
      </section>

      <section className="mt-10">
        <Contador />
      </section>
    </main>
  );
}
