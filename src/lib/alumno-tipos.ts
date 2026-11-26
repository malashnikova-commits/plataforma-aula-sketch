export type Misiones = {
  node: boolean;
  nextTailwind: boolean;
  v0: boolean;
  opencode: boolean;
  supabase: boolean;
};

export type Alumno = {
  usuario: string;
  nombre: string;
  frase: string;
  emoji: string;
  color: string;
  misiones: Misiones;
  promptFavorito: string;
};

export function misionesCompletadas(alumno: Alumno): number {
  return Object.values(alumno.misiones).filter(Boolean).length;
}

export const TOTAL_MISIONES = 5;
