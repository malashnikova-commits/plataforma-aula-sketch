"use client";

// Motor procedural de audio basado exclusivamente en Web Audio API nativa.
// Seguro para SSR (no accede a window fuera de funciones invocadas en el cliente),
// ganancia suave (0.025 – 0.12) y desconexión automática de nodos para evitar fugas.

type MuteListener = (muted: boolean) => void;

let audioCtx: AudioContext | null = null;
let mutedState = false;
let lastHoverTime = 0;
let loopIntervalId: number | null = null;
let activeLoopNodes: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
const muteListeners = new Set<MuteListener>();

// 3 progresiones Lo-Fi distintas (frecuencias en Hz) y parámetros de timbre
const PROGRESIONES_LOFI: {
  pasoMs: number;
  cutoffHz: number;
  acordes: [number, number, number][];
}[] = [
  // Pista 0: "chill tunes" · Lo-Fi Sketchbook (Cmaj7 → Am7 → Fmaj7 → G6)
  {
    pasoMs: 680,
    cutoffHz: 860,
    acordes: [
      [261.63, 329.63, 493.88],
      [220.0, 329.63, 392.0],
      [174.61, 261.63, 329.63],
      [196.0, 293.66, 329.63],
    ],
  },
  // Pista 1: "midnight deploy" · Synth suave (Dm9 → G13 → Cmaj7 → A7sus4)
  {
    pasoMs: 760,
    cutoffHz: 720,
    acordes: [
      [293.66, 349.23, 440.0],
      [196.0, 329.63, 349.23],
      [261.63, 329.63, 392.0],
      [220.0, 293.66, 392.0],
    ],
  },
  // Pista 2: "pixel coffee" · Chillhop (Fmaj7 → Em7 → Dm7 → Cmaj7)
  {
    pasoMs: 560,
    cutoffHz: 980,
    acordes: [
      [349.23, 440.0, 523.25],
      [329.63, 392.0, 493.88],
      [293.66, 349.23, 440.0],
      [261.63, 329.63, 392.0],
    ],
  },
];

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;
    audioCtx = new AudioCtxClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

export function isMuted(): boolean {
  return mutedState;
}

export function setMuted(valor: boolean): boolean {
  mutedState = valor;
  if (mutedState) {
    stopLoFiLoop();
  }
  muteListeners.forEach((fn) => fn(mutedState));
  return mutedState;
}

export function toggleMuted(): boolean {
  return setMuted(!mutedState);
}

export function subscribeMuted(listener: MuteListener): () => void {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

/**
 * 1. Clic suave tipo burbuja/papel (45 ms, onda sine con caída rápida de tono).
 */
export function playPop(): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(185, now + 0.05);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.095, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };

  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * 2. Nota ascendente proporcional al nivel (0–100).
 *    Si nivel === 100, dispara un acorde alegre de 3 notas (chime de celebración).
 */
export function playLevelUp(nivel: number): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const clamped = Math.max(0, Math.min(100, nivel));
  const now = ctx.currentTime;

  if (clamped === 100) {
    const notasChime = [523.25, 659.25, 783.99]; // C5 - E5 - G5
    notasChime.forEach((freq, idx) => {
      const inicio = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, inicio);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, inicio + 0.16);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, inicio);

      gain.gain.setValueAtTime(0.001, inicio);
      gain.gain.linearRampToValueAtTime(0.11, inicio + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };

      osc.start(inicio);
      osc.stop(inicio + 0.26);
    });
    return;
  }

  // Escala suave entre 310 Hz (0%) y 740 Hz (90%+)
  const baseFreq = 310 + (clamped / 100) * 430;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(baseFreq * 0.92, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.08, now + 0.085);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1400, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.onended = () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  };

  osc.start(now);
  osc.stop(now + 0.11);
}

/**
 * 3. Sonido táctil de interruptor (ascendente al activar, descendente al desactivar).
 */
export function playToggle(activo: boolean): void {
  if (mutedState) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const fInicio = activo ? 370 : 540;
  const fFin = activo ? 560 : 350;

  osc.type = "sine";
  osc.frequency.setValueAtTime(fInicio, now);
  osc.frequency.exponentialRampToValueAtTime(fFin, now + 0.065);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * 4. Micro-clic sutil (18 ms) con limitador de frecuencia para evitar saturación.
 */
export function playHoverTick(): void {
  if (mutedState || typeof window === "undefined") return;
  const ahoraMs = performance.now();
  if (ahoraMs - lastHoverTime < 55) return;
  lastHoverTime = ahoraMs;

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.016);

  gain.gain.setValueAtTime(0.0005, now);
  gain.gain.linearRampToValueAtTime(0.03, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };

  osc.start(now);
  osc.stop(now + 0.02);
}

/**
 * 5. Mini sintetizador Lo-Fi con ondas triangle filtradas por BiquadFilterNode (lowpass).
 */
export function stopLoFiLoop(): void {
  if (typeof window !== "undefined" && loopIntervalId !== null) {
    window.clearInterval(loopIntervalId);
    loopIntervalId = null;
  }

  if (audioCtx && activeLoopNodes.length > 0) {
    const now = audioCtx.currentTime;
    activeLoopNodes.forEach(({ osc, gain, filter }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0002), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.stop(now + 0.05);
      } catch {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      }
    });
  }
  activeLoopNodes = [];
}

export function startLoFiLoop(pistaIdx: number): void {
  stopLoFiLoop();
  if (mutedState || typeof window === "undefined") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const config = PROGRESIONES_LOFI[((pistaIdx % PROGRESIONES_LOFI.length) + PROGRESIONES_LOFI.length) % PROGRESIONES_LOFI.length];
  let paso = 0;

  const dispararPaso = () => {
    if (mutedState) {
      stopLoFiLoop();
      return;
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const acorde = config.acordes[Math.floor(paso / 2) % config.acordes.length];
    const notaArpegio = acorde[paso % acorde.length];
    const esCambioAcorde = paso % 2 === 0;
    paso += 1;

    const voces = esCambioAcorde ? [acorde[0] * 0.5, notaArpegio] : [notaArpegio];
    const now = ctx.currentTime;
    const duracionSeg = (config.pasoMs / 1000) * 0.92;

    voces.forEach((freq, idxVoz) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(config.cutoffHz, now);
      filter.Q.setValueAtTime(1.15, now);

      const picoGanancia = idxVoz === 0 && voces.length > 1 ? 0.06 : 0.075;
      gain.gain.setValueAtTime(0.0002, now);
      gain.gain.linearRampToValueAtTime(picoGanancia, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duracionSeg);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const refNodo = { osc, gain, filter };
      activeLoopNodes.push(refNodo);

      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
        activeLoopNodes = activeLoopNodes.filter((n) => n !== refNodo);
      };

      osc.start(now);
      osc.stop(now + duracionSeg + 0.02);
    });
  };

  dispararPaso();
  loopIntervalId = window.setInterval(dispararPaso, config.pasoMs);
}
