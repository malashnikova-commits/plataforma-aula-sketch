"use client";

import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export type RolPlataforma = "alumnado" | "tutor";

export interface UsuarioSesion {
  userId: string;
  identificador: string;
  alias: string;
  avatar: string;
  rol: RolPlataforma;
  modo: "supabase" | "local";
  createdAt: string;
}

export interface EntregaAlumno {
  id: string;
  trabajoId: string;
  userId: string;
  aliasAlumno: string;
  comentario: string;
  adjuntoId?: string;
  nombreAdjunto?: string;
  calificacionPorcentaje: number | null;
  retroalimentacion?: string;
  updatedAt: string;
}

export interface ProgresoUsuario {
  userId: string;
  xp: number;
  anguloGrados: number;
  nodosCompletados: string[];
  apuntes: string;
  entregas: EntregaAlumno[];
  updatedAt: string;
}

interface RegistroLocalUsuario {
  userId: string;
  identificador: string;
  alias: string;
  avatar: string;
  rol: RolPlataforma;
  passwordHash: string;
  createdAt: string;
}

const CLAVE_USUARIOS = "plataforma-usuarios-v1";
const CLAVE_SESION = "plataforma-sesion-v1";

export const CODIGO_TUTOR_DEMO =
  process.env.NEXT_PUBLIC_TUTOR_CODE?.trim() || "TUTOR2026";

export function crearProgresoDesdeCero(userId: string): ProgresoUsuario {
  return {
    userId,
    xp: 0,
    anguloGrados: 0,
    nodosCompletados: [],
    apuntes: "",
    entregas: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function hashPasswordSHA256(
  identificadorNormalizado: string,
  password: string
): Promise<string> {
  const texto = `${identificadorNormalizado}::${password}`;
  const bytes = new TextEncoder().encode(texto);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function leerUsuariosLocales(): RegistroLocalUsuario[] {
  try {
    const raw = window.localStorage.getItem(CLAVE_USUARIOS);
    return raw ? (JSON.parse(raw) as RegistroLocalUsuario[]) : [];
  } catch {
    return [];
  }
}

function guardarUsuariosLocales(lista: RegistroLocalUsuario[]): void {
  try {
    window.localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
  } catch {
    // Ignorar error de cuota
  }
}

export function leerSesionActivaLocal(): UsuarioSesion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLAVE_SESION);
    return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
  } catch {
    return null;
  }
}

export function guardarSesionActivaLocal(sesion: UsuarioSesion | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!sesion) window.localStorage.removeItem(CLAVE_SESION);
    else window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Ignorar
  }
}

export async function registrarUsuario(params: {
  identificador: string;
  password: string;
  alias: string;
  avatar: string;
  rol: RolPlataforma;
  codigoTutor?: string;
}): Promise<{ ok: true; usuario: UsuarioSesion } | { ok: false; error: string }> {
  const idNorm = params.identificador.trim().toLowerCase();
  const alias = params.alias.trim();

  if (idNorm.length < 3) {
    return { ok: false, error: "Usa un correo o usuario de al menos 3 caracteres." };
  }
  if (params.password.length < 4) {
    return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  }
  if (alias.length < 2) {
    return { ok: false, error: "Escribe un alias de al menos 2 caracteres." };
  }
  if (params.rol === "tutor" && (params.codigoTutor ?? "").trim() !== CODIGO_TUTOR_DEMO) {
    return { ok: false, error: "Código de invitación docente inválido." };
  }

  if (supabaseConfigurado() && idNorm.includes("@")) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: idNorm,
        password: params.password,
        options: {
          data: { alias, avatar: params.avatar, rol: params.rol },
        },
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        const sesion: UsuarioSesion = {
          userId: data.user.id,
          identificador: idNorm,
          alias,
          avatar: params.avatar,
          rol: params.rol,
          modo: "supabase",
          createdAt: new Date().toISOString(),
        };
        guardarSesionActivaLocal(sesion);
        return { ok: true, usuario: sesion };
      }
    }
  }

  const existentes = leerUsuariosLocales();
  if (existentes.some((u) => u.identificador === idNorm)) {
    return { ok: false, error: "Ese usuario ya existe en este dispositivo." };
  }

  const passwordHash = await hashPasswordSHA256(idNorm, params.password);
  const userId =
    typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `usr-${Date.now()}`;

  const nuevo: RegistroLocalUsuario = {
    userId,
    identificador: idNorm,
    alias,
    avatar: params.avatar || "👽",
    rol: params.rol,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  guardarUsuariosLocales([...existentes, nuevo]);
  const sesion: UsuarioSesion = {
    userId: nuevo.userId,
    identificador: nuevo.identificador,
    alias: nuevo.alias,
    avatar: nuevo.avatar,
    rol: nuevo.rol,
    modo: "local",
    createdAt: nuevo.createdAt,
  };
  guardarSesionActivaLocal(sesion);
  return { ok: true, usuario: sesion };
}

export async function iniciarSesionUsuario(params: {
  identificador: string;
  password: string;
}): Promise<{ ok: true; usuario: UsuarioSesion } | { ok: false; error: string }> {
  const idNorm = params.identificador.trim().toLowerCase();
  if (!idNorm || !params.password) {
    return { ok: false, error: "Completa usuario y contraseña." };
  }

  if (supabaseConfigurado() && idNorm.includes("@")) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: idNorm,
        password: params.password,
      });
      if (!error && data.user) {
        const meta = data.user.user_metadata ?? {};
        const sesion: UsuarioSesion = {
          userId: data.user.id,
          identificador: idNorm,
          alias: String(meta.alias || idNorm.split("@")[0]),
          avatar: String(meta.avatar || "👽"),
          rol: meta.rol === "tutor" ? "tutor" : "alumnado",
          modo: "supabase",
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        guardarSesionActivaLocal(sesion);
        return { ok: true, usuario: sesion };
      }
    }
  }

  const existentes = leerUsuariosLocales();
  const encontrado = existentes.find((u) => u.identificador === idNorm);
  if (!encontrado) {
    return { ok: false, error: "Usuario no encontrado. Regístrate primero." };
  }

  const hashIntento = await hashPasswordSHA256(idNorm, params.password);
  if (hashIntento !== encontrado.passwordHash) {
    return { ok: false, error: "Contraseña incorrecta." };
  }

  const sesion: UsuarioSesion = {
    userId: encontrado.userId,
    identificador: encontrado.identificador,
    alias: encontrado.alias,
    avatar: encontrado.avatar,
    rol: encontrado.rol,
    modo: "local",
    createdAt: encontrado.createdAt,
  };
  guardarSesionActivaLocal(sesion);
  return { ok: true, usuario: sesion };
}

export async function cerrarSesionUsuario(): Promise<void> {
  if (supabaseConfigurado()) {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
  }
  guardarSesionActivaLocal(null);
}
