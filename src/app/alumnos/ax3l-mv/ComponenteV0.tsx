// MISIÓN 3 · Reemplaza TODO este archivo con el código que te dé v0.
// Reglas para que compile:
//   1. Debe exportar una función llamada ComponenteV0:  export function ComponenteV0() { ... }
//   2. Solo Tailwind: si v0 usa componentes de "@/components/ui/...", pídele:
//      "reescríbelo sin shadcn, solo con HTML y clases de Tailwind".
//   3. Si usa useState u onClick, la PRIMERA línea del archivo debe ser: "use client";

'use client'

import { useState } from 'react'

const answers = [
  { id: 'map', label: 'map()', detail: 'Crea un array nuevo transformando sus elementos.' },
  { id: 'filter', label: 'filter()', detail: 'Crea un array nuevo con los elementos que cumplen una condición.' },
  { id: 'sort', label: 'sort()', detail: 'Ordena directamente el array original.' },
  { id: 'slice', label: 'slice()', detail: 'Devuelve una copia de una parte del array.' },
]

export function ComponenteV0() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const isCorrect = selectedAnswer === 'sort'

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1110] p-4 text-[#edf3ec]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-48 -z-10 size-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-32 -z-10 size-[26rem] rounded-full bg-lime-300/[0.07] blur-[120px]" />

      <section
        aria-labelledby="quiz-question"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141d1b]/95 p-4 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-lime-300/[0.06] motion-reduce:transition-none sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/45">
            <span className="font-bold text-lime-300">01</span><span>/</span><span>01</span>
          </div>
          <span className="rounded-full bg-lime-300/10 px-2.5 py-1 text-[10px] font-medium text-lime-200">⚡ Concepto clave</span>
        </div>

        <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10" aria-label="Pregunta 1 de 1">
          <div className="h-full w-full rounded-full bg-lime-300" />
        </div>

        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300/80">Pregunta</p>
        <h1 id="quiz-question" className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          ¿Cuál de estos métodos modifica el array original?
        </h1>
        <p className="mb-3 mt-2 text-xs text-white/45">Toca una opción para responder.</p>

        <div className="grid gap-2" role="group" aria-label="Opciones de respuesta">
          {answers.map((answer, index) => {
            const selected = selectedAnswer === answer.id
            const correctOption = answer.id === 'sort'
            const showCorrect = selectedAnswer !== null && correctOption
            const showIncorrect = selected && !correctOption
            const answerStyle = showCorrect
              ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100'
              : showIncorrect
                ? 'border-rose-400/50 bg-rose-400/10 text-rose-100'
                : 'border-white/10 bg-white/[0.025] text-white/80 hover:border-lime-300/30 hover:bg-white/[0.06]'

            return (
              <button
                key={answer.id}
                type="button"
                onClick={() => setSelectedAnswer(answer.id)}
                disabled={selectedAnswer !== null}
                aria-pressed={selected}
                aria-label={`Opción ${String.fromCharCode(65 + index)}: ${answer.label}. ${answer.detail}`}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:shadow-lime-300/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141d1b] disabled:cursor-default motion-reduce:transition-none ${answerStyle}`}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md border border-white/10 bg-black/10 font-mono text-[10px] text-white/55">{String.fromCharCode(65 + index)}</span>
                <span className="flex-1 font-mono text-xs font-semibold">{answer.label}</span>
                {showCorrect && <span className="text-[10px] font-semibold text-emerald-200">✅ Correcta</span>}
                {showIncorrect && <span className="text-[10px] font-semibold text-rose-200">❌ Incorrecta</span>}
                {!selectedAnswer && <span aria-hidden="true" className="text-xs text-white/30">↗</span>}
              </button>
            )
          })}
        </div>

        {selectedAnswer && (
          <div className={`mt-4 rounded-xl border p-3 ${isCorrect ? 'border-emerald-400/20 bg-emerald-400/[0.07]' : 'border-rose-400/20 bg-rose-400/[0.07]'}`} role="status" aria-live="polite">
            <p className={`flex items-center gap-2 text-xs font-semibold ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>
              <span aria-hidden="true">{isCorrect ? '🎉' : '💡'}</span>
              {isCorrect ? '¡Correcto! Buen ojo.' : 'No exactamente. Aquí va la pista:'}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-white/65">
              <code className="rounded bg-black/20 px-1 font-mono text-lime-200">sort()</code> ordena los elementos en el mismo array y devuelve una referencia a él. <code className="font-mono text-white/85">map()</code>, <code className="font-mono text-white/85">filter()</code> y <code className="font-mono text-white/85">slice()</code> crean uno nuevo.
            </p>
            <button
              type="button"
              onClick={() => setSelectedAnswer(null)}
              className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-lime-200 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
            >
              <span aria-hidden="true">↻</span> Intentarlo de nuevo
            </button>
          </div>
        )}

        {!selectedAnswer && <p className="mt-3 text-center text-[10px] text-white/35">Elige una opción para ver la explicación</p>}
      </section>
    </main>
  )
}