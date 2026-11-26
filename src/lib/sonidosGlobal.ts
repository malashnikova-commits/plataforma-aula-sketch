"use client";

type MuteListener = (muted: boolean) => void;

let globalAudioCtx: AudioContext | null = null;
let globalMuted = false;
const listeners = new Set<MuteListener>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    globalAudioCtx = new Ctor();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

export function isGlobalMuted(): boolean {
  return globalMuted;
}

export function setGlobalMuted(val: boolean): boolean {
  globalMuted = val;
  listeners.forEach((fn) => fn(globalMuted));
  return globalMuted;
}

export function toggleGlobalMuted(): boolean {
  return setGlobalMuted(!globalMuted);
}

export function subscribeGlobalMuted(fn: MuteListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function playPop(): void {
  if (globalMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
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

export function playToggle(activo: boolean): void {
  if (globalMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(activo ? 370 : 540, now);
  osc.frequency.exponentialRampToValueAtTime(activo ? 560 : 350, now + 0.065);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.075, now + 0.01);
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

export function playChime(): void {
  if (globalMuted) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, idx) => {
    const start = now + idx * 0.07;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.09, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(start);
    osc.stop(start + 0.24);
  });
}
