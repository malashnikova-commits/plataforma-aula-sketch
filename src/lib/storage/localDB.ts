"use client";

import type { EntregaAlumno, ProgresoUsuario } from "@/lib/auth";

export interface TrabajoPublicado {
  id: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  ponderacion: number;
  carpetaFuentes: string;
  adjuntoId?: string;
  nombreAdjunto?: string;
  createdAt: string;
}

export interface AdjuntoBinario {
  id: string;
  userId: string;
  nombre: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

const DB_NAME = "PlataformaSketchDB";
const DB_VERSION = 1;
const STORES = ["progresos", "adjuntos", "trabajos", "entregas"] as const;

function abrirDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const keyPath = storeName === "progresos" ? "userId" : "id";
          db.createObjectStore(storeName, { keyPath });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbPut<T>(storeName: (typeof STORES)[number], value: T): Promise<void> {
  const db = await abrirDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function idbGet<T>(storeName: (typeof STORES)[number], key: string): Promise<T | null> {
  const db = await abrirDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => resolve(null);
  });
}

async function idbGetAll<T>(storeName: (typeof STORES)[number]): Promise<T[]> {
  const db = await abrirDB();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => resolve([]);
  });
}

const CLAVE_PROGRESO_PREFIX = "plataforma-progreso-v1-";
const CLAVE_TRABAJOS = "plataforma-trabajos-v1";
const CLAVE_ENTREGAS = "plataforma-entregas-v1";

export async function guardarProgresoLocal(progreso: ProgresoUsuario): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${CLAVE_PROGRESO_PREFIX}${progreso.userId}`,
      JSON.stringify(progreso)
    );
  } catch {
    // Ignorar error de cuota
  }
  await idbPut("progresos", progreso);
}

export async function cargarProgresoLocal(userId: string): Promise<ProgresoUsuario | null> {
  if (typeof window === "undefined") return null;
  const desdeIDB = await idbGet<ProgresoUsuario>("progresos", userId);
  let desdeLS: ProgresoUsuario | null = null;
  try {
    const raw = window.localStorage.getItem(`${CLAVE_PROGRESO_PREFIX}${userId}`);
    desdeLS = raw ? (JSON.parse(raw) as ProgresoUsuario) : null;
  } catch {
    desdeLS = null;
  }

  if (desdeIDB && desdeLS) {
    return new Date(desdeIDB.updatedAt) >= new Date(desdeLS.updatedAt) ? desdeIDB : desdeLS;
  }
  return desdeIDB ?? desdeLS;
}

export async function guardarAdjuntoIDB(adjunto: AdjuntoBinario): Promise<void> {
  await idbPut("adjuntos", adjunto);
}

export async function obtenerAdjuntoIDB(id: string): Promise<AdjuntoBinario | null> {
  return idbGet<AdjuntoBinario>("adjuntos", id);
}

export async function guardarTrabajoLocal(trabajo: TrabajoPublicado): Promise<void> {
  await idbPut("trabajos", trabajo);
  if (typeof window !== "undefined") {
    const actuales = await listarTrabajosLocales();
    const mapa = new Map(actuales.map((t) => [t.id, t]));
    mapa.set(trabajo.id, trabajo);
    try {
      window.localStorage.setItem(CLAVE_TRABAJOS, JSON.stringify([...mapa.values()]));
    } catch {
      // Ignorar
    }
  }
}

export async function listarTrabajosLocales(): Promise<TrabajoPublicado[]> {
  const desdeIDB = await idbGetAll<TrabajoPublicado>("trabajos");
  if (desdeIDB.length > 0) return desdeIDB;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLAVE_TRABAJOS);
    return raw ? (JSON.parse(raw) as TrabajoPublicado[]) : [];
  } catch {
    return [];
  }
}

export async function guardarEntregaLocal(entrega: EntregaAlumno): Promise<void> {
  await idbPut("entregas", entrega);
  if (typeof window !== "undefined") {
    const actuales = await listarEntregasLocales();
    const mapa = new Map(actuales.map((e) => [e.id, e]));
    mapa.set(entrega.id, entrega);
    try {
      window.localStorage.setItem(CLAVE_ENTREGAS, JSON.stringify([...mapa.values()]));
    } catch {
      // Ignorar
    }
  }
}

export async function listarEntregasLocales(): Promise<EntregaAlumno[]> {
  const desdeIDB = await idbGetAll<EntregaAlumno>("entregas");
  if (desdeIDB.length > 0) return desdeIDB;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CLAVE_ENTREGAS);
    return raw ? (JSON.parse(raw) as EntregaAlumno[]) : [];
  } catch {
    return [];
  }
}

export function exportarRespaldoJSON(datos: unknown, nombreArchivo = "respaldo-aula.json"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(datos, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importarRespaldoJSON<T>(archivo: File): Promise<T | null> {
  try {
    const texto = await archivo.text();
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
}

export async function guardarRespaldoEnCarpetaDispositivo(
  datos: unknown
): Promise<{ ok: boolean; mensaje: string }> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return { ok: false, mensaje: "Tu navegador no soporta File System Access API." };
  }
  try {
    const picker = (
      window as unknown as {
        showDirectoryPicker: () => Promise<{
          getFileHandle: (
            name: string,
            opts: { create: boolean }
          ) => Promise<{
            createWritable: () => Promise<{
              write: (data: string) => Promise<void>;
              close: () => Promise<void>;
            }>;
          }>;
        }>;
      }
    ).showDirectoryPicker;
    const dirHandle = await picker();
    const nombre = `respaldo-aula-${new Date().toISOString().slice(0, 10)}.json`;
    const fileHandle = await dirHandle.getFileHandle(nombre, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(datos, null, 2));
    await writable.close();
    return { ok: true, mensaje: `Guardado en ${nombre}` };
  } catch {
    return { ok: false, mensaje: "Operación cancelada o sin permiso de carpeta." };
  }
}
