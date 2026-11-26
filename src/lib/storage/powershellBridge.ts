"use client";

const BASE_BANCO_URL = "http://127.0.0.1:4780";

export interface RespuestaBanco {
  disponible: boolean;
  datos?: unknown;
  error?: string;
}

export function esEntornoLocalNavegador(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

async function fetchBanco(
  ruta: string,
  token: string,
  init?: RequestInit
): Promise<RespuestaBanco> {
  if (!esEntornoLocalNavegador()) {
    return { disponible: false, error: "Desactivado fuera de localhost" };
  }
  try {
    const res = await fetch(`${BASE_BANCO_URL}${ruta}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Local-Token": token,
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(1200),
    });

    if (!res.ok) {
      return { disponible: true, error: `HTTP ${res.status}` };
    }
    const datos = await res.json();
    return { disponible: true, datos };
  } catch {
    return { disponible: false };
  }
}

export function probarEstadoBanco(token: string): Promise<RespuestaBanco> {
  return fetchBanco("/api/estado", token, { method: "GET" });
}

export function enviarProgresoBanco(
  token: string,
  payload: unknown
): Promise<RespuestaBanco> {
  return fetchBanco("/api/guardar-progreso", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function subirArchivoBanco(
  token: string,
  meta: { userId: string; nombre: string },
  base64: string
): Promise<RespuestaBanco> {
  return fetchBanco("/api/subir-archivo", token, {
    method: "POST",
    body: JSON.stringify({ ...meta, contenidoBase64: base64 }),
  });
}

export function listarBanco(token: string): Promise<RespuestaBanco> {
  return fetchBanco("/api/listar", token, { method: "GET" });
}
