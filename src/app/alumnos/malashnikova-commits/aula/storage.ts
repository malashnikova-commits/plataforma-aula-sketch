"use client";

import { crearCursoInicial, crearProgresoInicial } from "./datosIniciales";
import type { ConfiguracionCurso, ProgresoAlumno } from "./types";

const CLAVE_CURSO = "aula-sketchbook-curso-v1";
const CLAVE_PROGRESO = "aula-sketchbook-progreso-v1";

/**
 * Interfaz desacoplada de persistencia: actualmente respaldada en localStorage,
 * lista para conectarse a una tabla de Supabase (ej. `aula_config` / `aula_progreso`) en el futuro.
 */
export interface AulaRepositorioAdapter {
  cargarCurso: (hoyISO: string) => ConfiguracionCurso;
  guardarCurso: (curso: ConfiguracionCurso) => void;
  cargarProgreso: (hoyISO: string) => ProgresoAlumno;
  guardarProgreso: (progreso: ProgresoAlumno) => void;
  restablecerFabrica: (hoyISO: string) => { curso: ConfiguracionCurso; progreso: ProgresoAlumno };
}

export const aulaStorageLocal: AulaRepositorioAdapter = {
  cargarCurso(hoyISO: string): ConfiguracionCurso {
    if (typeof window === "undefined") return crearCursoInicial(hoyISO);
    try {
      const raw = window.localStorage.getItem(CLAVE_CURSO);
      if (!raw) {
        const inicial = crearCursoInicial(hoyISO);
        window.localStorage.setItem(CLAVE_CURSO, JSON.stringify(inicial));
        return inicial;
      }
      const parsed = JSON.parse(raw) as ConfiguracionCurso;
      if (!parsed || !Array.isArray(parsed.nodos) || !Array.isArray(parsed.carpetas)) {
        return crearCursoInicial(hoyISO);
      }
      return parsed;
    } catch {
      return crearCursoInicial(hoyISO);
    }
  },

  guardarCurso(curso: ConfiguracionCurso): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CLAVE_CURSO, JSON.stringify(curso));
    } catch {
      // Ignorar cuota excedida o modo privado restringido
    }
  },

  cargarProgreso(hoyISO: string): ProgresoAlumno {
    if (typeof window === "undefined") return crearProgresoInicial(hoyISO);
    try {
      const raw = window.localStorage.getItem(CLAVE_PROGRESO);
      if (!raw) {
        const inicial = crearProgresoInicial(hoyISO);
        window.localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(inicial));
        return inicial;
      }
      const parsed = JSON.parse(raw) as ProgresoAlumno;
      if (!parsed || typeof parsed.alias !== "string") {
        return crearProgresoInicial(hoyISO);
      }
      return parsed;
    } catch {
      return crearProgresoInicial(hoyISO);
    }
  },

  guardarProgreso(progreso: ProgresoAlumno): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
    } catch {
      // Ignorar errores de almacenamiento
    }
  },

  restablecerFabrica(hoyISO: string) {
    const curso = crearCursoInicial(hoyISO);
    const progreso = crearProgresoInicial(hoyISO);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CLAVE_CURSO, JSON.stringify(curso));
        window.localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
      } catch {
        // Ignorar
      }
    }
    return { curso, progreso };
  },
};

export function descargarCursoComoJSON(curso: ConfiguracionCurso): void {
  if (typeof window === "undefined") return;
  const exportable: ConfiguracionCurso = {
    ...curso,
    // Conserva estructura completa para compartir con el grupo
    version: 1,
  };
  const blob = new Blob([JSON.stringify(exportable, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aula-temario-sketchbook.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function validarCursoImportado(textoJSON: string, pinActual: string): {
  ok: true;
  curso: ConfiguracionCurso;
} | {
  ok: false;
  error: string;
} {
  try {
    const data = JSON.parse(textoJSON) as Partial<ConfiguracionCurso>;
    if (!data || typeof data !== "object") {
      return { ok: false, error: "El archivo no contiene un objeto JSON válido." };
    }
    if (typeof data.nombreCurso !== "string" || !data.nombreCurso.trim()) {
      return { ok: false, error: "Falta el campo 'nombreCurso' en el JSON." };
    }
    if (!Array.isArray(data.nodos) || data.nodos.length === 0) {
      return { ok: false, error: "El JSON debe incluir al menos un nodo en 'nodos'." };
    }
    if (!Array.isArray(data.carpetas) || !Array.isArray(data.proyectos)) {
      return { ok: false, error: "Faltan los arreglos 'carpetas' o 'proyectos' en el JSON." };
    }

    const cursoNormalizado: ConfiguracionCurso = {
      version: 1,
      nombreCurso: data.nombreCurso.trim(),
      subtitulo:
        typeof data.subtitulo === "string"
          ? data.subtitulo
          : "Temario importado en Aula Sketchbook",
      pinDocente:
        typeof data.pinDocente === "string" && data.pinDocente.trim().length >= 4
          ? data.pinDocente.trim()
          : pinActual,
      nodos: data.nodos,
      carpetas: data.carpetas,
      proyectos: data.proyectos,
    };

    return { ok: true, curso: cursoNormalizado };
  } catch {
    return { ok: false, error: "No se pudo leer el JSON. Verifica que no tenga errores de sintaxis." };
  }
}
