# Skill: Next.js Build & PR Guard

## Reglas de compilación y ramas
1. Ningún Client Component (`"use client";`) debe importar módulos que usen `node:fs`; usar tipos puros en `src/lib/alumno-tipos.ts`.
2. Toda lectura de `localStorage`, `IndexedDB`, `window`, `AudioContext` o `new Date()` debe ejecutarse dentro de `useEffect` para evitar *hydration mismatch*.
3. Usar siempre clases literales completas de Tailwind (prohibido `bg-${color}-500`).
4. Mantener `entrega/<usuario>` intacta para el bot del taller y desarrollar mejoras globales en `app/plataforma-completa`.
