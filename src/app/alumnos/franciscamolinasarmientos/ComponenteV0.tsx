'use client'

import { useEffect, useState } from 'react'

const TRACK_LENGTH = 193

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function ComponenteV0() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(102)

  useEffect(() => {
    if (!isPlaying) return

    const intervalId = window.setInterval(() => {
      setProgress((current) => (current >= TRACK_LENGTH ? 0 : current + 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isPlaying])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-10 text-white selection:bg-[#ffd1dc]/30">
      <section
        aria-label="Reproductor de música"
        className="w-full max-w-sm rounded-[2rem] border border-white/[0.08] bg-[#121216] p-6 shadow-[0_24px_90px_-35px_rgba(255,209,220,0.22)] sm:p-8"
      >
        <header className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Ahora suena</p>
            <p className="mt-1 text-xs text-zinc-400">Tu espacio, tu música</p>
          </div>
          <span aria-hidden="true" className="text-xl">🎵</span>
        </header>

        <div className="relative mb-7 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffd1dc] via-[#f7a8bb] to-[#c36f89]">
          <div aria-hidden="true" className="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/15" />
          <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full border border-white/15" />
          <div aria-hidden="true" className="absolute inset-5 rounded-xl border border-white/10" />
          <span aria-hidden="true" className="relative text-7xl drop-shadow-lg sm:text-8xl">🎵</span>
          <span className="absolute bottom-4 right-4 rounded-full bg-black/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">Mi favorita</span>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">IBELONGIIU</h1>
            <p className="mt-1 text-sm text-zinc-400">G-DRAGON</p>
          </div>
          <span aria-label="Me gusta" className="shrink-0 text-xl text-[#ffd1dc]">♥</span>
        </div>

        <div className="mb-2">
          <label className="sr-only" htmlFor="track-progress">Progreso de la canción</label>
          <input
            id="track-progress"
            type="range"
            min={0}
            max={TRACK_LENGTH}
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-[#ffd1dc]"
          />
          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-zinc-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(TRACK_LENGTH)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center py-2">
          <button
            type="button"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying((playing) => !playing)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffd1dc] text-2xl text-[#341824] shadow-lg shadow-[#ffd1dc]/20 transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd1dc] focus-visible:ring-offset-4 focus-visible:ring-offset-[#121216]"
          >
            <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
        </div>

        <p className="mt-7 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">REPRODUCTOR DE MUESTRA</p>
      </section>
    </main>
  )
}