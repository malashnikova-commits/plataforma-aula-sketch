"use client";

import type { ConfiguracionCurso, ProgresoAlumno } from "./types";

export const PIN_DOCENTE_INICIAL = "DOCENTE2026";
export const FECHA_SEMILLA_SSR = "2026-11-25";

/**
 * Suma o resta días sobre una fecha YYYY-MM-DD en UTC puro para evitar desfases de huso horario.
 */
export function desplazarFechaISO(baseISO: string, dias: number): string {
  const [y, m, d] = baseISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + dias));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatearFechaLocalHoy(fecha: Date): string {
  const yy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function crearCursoInicial(hoyISO: string = FECHA_SEMILLA_SSR): ConfiguracionCurso {
  return {
    version: 1,
    nombreCurso: "Ruta Full-Stack Next.js + Agentes IA",
    subtitulo: "Aula interactiva Sketchbook · Mapa de nodos, fuentes y entregas",
    pinDocente: PIN_DOCENTE_INICIAL,
    carpetas: [
      {
        id: "carpeta-lecturas",
        nombre: "Lecturas Base",
        emoji: "📚",
        descripcion: "Conceptos esenciales de Node.js, App Router, Server vs Client Components y RLS.",
        nodoIds: ["nodo-1-entorno", "nodo-2-node", "nodo-3-nextjs", "nodo-6-supabase"],
        recursos: [
          {
            id: "rec-1",
            titulo: "Guía mental: Server vs Client Components",
            tipo: "Apunte",
            resumen:
              "Por defecto todo en src/app corre en el servidor; usa 'use client' únicamente cuando necesites estado, efectos o APIs del navegador.",
          },
          {
            id: "rec-2",
            titulo: "Documentación oficial de Next.js App Router",
            tipo: "Enlace",
            resumen: "Referencia de carpetas, layouts, carga de datos y rutas dinámicas.",
            url: "https://nextjs.org/docs/app",
          },
          {
            id: "rec-3",
            titulo: "Seguridad con Row Level Security (RLS) en Postgres",
            tipo: "Guía",
            resumen:
              "Por qué activar RLS y definir políticas explícitas antes de usar una llave pública en el cliente.",
            url: "https://supabase.com/docs/guides/database/postgres/row-level-security",
          },
        ],
      },
      {
        id: "carpeta-practicas",
        nombre: "Prácticas y Prompts",
        emoji: "🧪",
        descripcion: "Plantillas de prompts efectivos para v0, OpenCode y validación local.",
        nodoIds: ["nodo-3-nextjs", "nodo-4-v0", "nodo-5-opencode"],
        recursos: [
          {
            id: "rec-4",
            titulo: "Anatomía de un buen prompt de interfaz para v0",
            tipo: "Guía",
            resumen:
              "Especifica qué es, qué contiene, paleta exacta, comportamiento al clic y restricción de cero librerías externas.",
          },
          {
            id: "rec-5",
            titulo: "Reto práctico: Componente reactivo sin clases dinámicas rotas",
            tipo: "Ejercicio",
            resumen:
              "Practica combinar clases completas de Tailwind con style={{ width }} para barras de progreso dinámicas.",
          },
          {
            id: "rec-6",
            titulo: "Catálogo de modelos en NVIDIA Build",
            tipo: "Enlace",
            resumen: "Explora modelos gratuitos compatibles con OpenCode mediante llave nvapi-.",
            url: "https://build.nvidia.com",
          },
        ],
      },
      {
        id: "carpeta-referencias",
        nombre: "Videos y Referencias",
        emoji: "🎥",
        descripcion: "Inspiración visual Sketch Doodle Art, accesibilidad WCAG y flujo de Pull Requests.",
        nodoIds: ["nodo-1-entorno", "nodo-4-v0", "nodo-6-supabase"],
        recursos: [
          {
            id: "rec-7",
            titulo: "Checklist de contraste WCAG 2.1 AA en interfaces ilustradas",
            tipo: "Apunte",
            resumen:
              "Usa tinta Gibraltar Sea (#123850) sobre fondos Baby Powder (#FEFEFA) y acentos Gold Coast (#D69A3F) para superar 4.5:1.",
          },
          {
            id: "rec-8",
            titulo: "Flujo limpio de Fork, Rama y Pull Request en GitHub",
            tipo: "Enlace",
            resumen: "Cómo mantener tu rama aislada tocando únicamente tus archivos personales.",
            url: "https://docs.github.com/es/pull-requests",
          },
        ],
      },
    ],
    proyectos: [
      {
        id: "proy-1-ui",
        titulo: "Bitácora Visual Sketchbook",
        emoji: "🎨",
        descripcion:
          "Diseña y programa tu tarjeta personal combinando Tailwind CSS, un componente interactivo de v0 y micro-interacciones accesibles.",
        fechaInicio: desplazarFechaISO(hoyISO, -3),
        fechaLimite: desplazarFechaISO(hoyISO, 2),
        xpExtra: 120,
        nodoIds: ["nodo-3-nextjs", "nodo-4-v0"],
        entregables: [
          { id: "ent-1", texto: "Encabezado responsivo md:flex-row con paleta propia" },
          { id: "ent-2", texto: "Sección 'Lo que aprendí hoy' con 3 puntos claros" },
          { id: "ent-3", texto: "ComponenteV0 interactivo compilando sin dependencias externas" },
        ],
      },
      {
        id: "proy-2-pr",
        titulo: "Entrega Final: Agente IA + Base de Datos + PR",
        emoji: "🚀",
        descripcion:
          "Integra un componente creado con OpenCode, conecta el MCP de Supabase y publica tu Pull Request validado en verde.",
        fechaInicio: desplazarFechaISO(hoyISO, 0),
        fechaLimite: desplazarFechaISO(hoyISO, 6),
        xpExtra: 180,
        nodoIds: ["nodo-5-opencode", "nodo-6-supabase"],
        entregables: [
          { id: "ent-4", texto: "Componente cliente Reacciones.tsx funcionando con estado" },
          { id: "ent-5", texto: "Tabla public.mensajes con políticas RLS para select e insert" },
          { id: "ent-6", texto: "npm run validar y npm run build aprobados sin errores" },
        ],
      },
    ],
    nodos: [
      {
        id: "nodo-1-entorno",
        orden: 1,
        unidad: "Unidad 1 · Despegue",
        titulo: "M0 · Entorno, Fork y Rama",
        descripcion:
          "Prepara Node.js 20.9+, haz fork del repositorio, crea tu rama personal y levanta el servidor local.",
        emoji: "🧭",
        xp: 50,
        fechaInicio: desplazarFechaISO(hoyISO, -6),
        fechaLimite: desplazarFechaISO(hoyISO, -3),
        tiempoEstimado: "30 min",
        prerequisitoId: null,
        carpetasIds: ["carpeta-lecturas", "carpeta-referencias"],
        proyectoId: null,
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c1-1", texto: "Verificar node -v (20.9+) y git -v en terminal" },
          { id: "c1-2", texto: "Clonar fork y crear rama entrega/<tu-usuario>" },
          { id: "c1-3", texto: "Abrir localhost:3000 con npm run dev" },
        ],
        preguntaRapida: {
          pregunta: "¿Por qué trabajamos en una rama entrega/<usuario> en lugar de editar archivos globales?",
          opciones: [
            "Para que el validador del PR confirme que cada quien solo modificó su carpeta",
            "Porque Next.js no compila en la rama main",
            "Para desactivar TypeScript automáticamente",
          ],
          indiceCorrecto: 0,
        },
      },
      {
        id: "nodo-2-node",
        orden: 2,
        unidad: "Unidad 1 · Despegue",
        titulo: "M1 · Node.js y Espacio Propio",
        descripcion:
          "Ejecuta scripts en consola fuera del navegador, genera tu carpeta personal y personaliza tu JSON.",
        emoji: "🟢",
        xp: 70,
        fechaInicio: desplazarFechaISO(hoyISO, -4),
        fechaLimite: desplazarFechaISO(hoyISO, -1),
        tiempoEstimado: "45 min",
        prerequisitoId: "nodo-1-entorno",
        carpetasIds: ["carpeta-lecturas"],
        proyectoId: null,
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c2-1", texto: "Ejecutar npm run node:archivos y nuevo-alumno" },
          { id: "c2-2", texto: "Personalizar nombre, frase, emoji y color hex en JSON" },
          { id: "c2-3", texto: "Aprobar npm run validar con tu usuario" },
        ],
        preguntaRapida: {
          pregunta: "¿Qué módulo nativo permite a Node.js leer la carpeta /alumnos en el servidor?",
          opciones: ["API Web Storage del navegador", "node:fs", "document.querySelector"],
          indiceCorrecto: 1,
        },
      },
      {
        id: "nodo-3-nextjs",
        orden: 3,
        unidad: "Unidad 2 · Interfaz",
        titulo: "M2 · Next.js + Tailwind Sketch",
        descripcion:
          "Resuelve los retos de diseño responsivo, bordes, hover y lista de aprendizajes comprendiendo Server Components.",
        emoji: "🎨",
        xp: 90,
        fechaInicio: desplazarFechaISO(hoyISO, -2),
        fechaLimite: desplazarFechaISO(hoyISO, 1),
        tiempoEstimado: "1.5 h",
        prerequisitoId: "nodo-2-node",
        carpetasIds: ["carpeta-lecturas", "carpeta-practicas"],
        proyectoId: "proy-1-ui",
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c3-1", texto: "Aplicar md:flex-row md:items-center en el encabezado" },
          { id: "c3-2", texto: "Agregar transición hover y sección 'Lo que aprendí hoy'" },
          { id: "c3-3", texto: "Usar style={{ color }} para datos dinámicos en vez de clases partidas" },
        ],
        preguntaRapida: {
          pregunta: "¿Por qué concatenar fragmentos dinámicos de clases de color no funciona en Tailwind CSS?",
          opciones: [
            "Porque Tailwind escanea nombres de clase completos en texto estático",
            "Porque Tailwind solo acepta colores en RGB",
            "Porque requiere instalar un plugin externo",
          ],
          indiceCorrecto: 0,
        },
      },
      {
        id: "nodo-4-v0",
        orden: 4,
        unidad: "Unidad 2 · Interfaz",
        titulo: "M3 · Diseño asistido con v0",
        descripcion:
          "Itera un componente interactivo con IA, adáptalo a HTML + Tailwind puro y expórtalo como ComponenteV0.",
        emoji: "✨",
        xp: 100,
        fechaInicio: desplazarFechaISO(hoyISO, 0),
        fechaLimite: desplazarFechaISO(hoyISO, 2),
        tiempoEstimado: "1 h",
        prerequisitoId: "nodo-3-nextjs",
        carpetasIds: ["carpeta-practicas", "carpeta-referencias"],
        proyectoId: "proy-1-ui",
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c4-1", texto: "Incluir 'use client'; en la primera línea al usar useState" },
          { id: "c4-2", texto: "Exportar export function ComponenteV0() sin shadcn/ui" },
          { id: "c4-3", texto: "Probar micro-interacciones y accesibilidad por teclado" },
        ],
      },
      {
        id: "nodo-5-opencode",
        orden: 5,
        unidad: "Unidad 3 · Agentes y Datos",
        titulo: "M4 · OpenCode + Modelo NVIDIA",
        descripcion:
          "Configura tu llave nvapi- en entorno local y coordina al agente para construir un componente cliente.",
        emoji: "🤖",
        xp: 110,
        fechaInicio: desplazarFechaISO(hoyISO, 1),
        fechaLimite: desplazarFechaISO(hoyISO, 4),
        tiempoEstimado: "1.5 h",
        prerequisitoId: "nodo-4-v0",
        carpetasIds: ["carpeta-practicas"],
        proyectoId: "proy-2-pr",
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c5-1", texto: "Guardar NVIDIA_API_KEY en .env.local (nunca en Git)" },
          { id: "c5-2", texto: "Crear Reacciones.tsx dentro de tu carpeta personal" },
          { id: "c5-3", texto: "Registrar tu promptFavorito en tu archivo JSON" },
        ],
      },
      {
        id: "nodo-6-supabase",
        orden: 6,
        unidad: "Unidad 3 · Agentes y Datos",
        titulo: "M5 · Supabase MCP y Pull Request",
        descripcion:
          "Conecta el agente a Postgres con RLS, verifica npm run build y abre tu Pull Request hacia main.",
        emoji: "🚀",
        xp: 130,
        fechaInicio: desplazarFechaISO(hoyISO, 3),
        fechaLimite: desplazarFechaISO(hoyISO, 6),
        tiempoEstimado: "2 h",
        prerequisitoId: "nodo-5-opencode",
        carpetasIds: ["carpeta-lecturas", "carpeta-referencias"],
        proyectoId: "proy-2-pr",
        bloqueoPorFecha: false,
        desbloqueoManual: false,
        visible: true,
        checklist: [
          { id: "c6-1", texto: "Crear tabla public.mensajes con políticas RLS anon" },
          { id: "c6-2", texto: "Confirmar git status limpio y npm run build exitoso" },
          { id: "c6-3", texto: "Publicar rama y abrir Pull Request con evidencias" },
        ],
      },
    ],
  };
}

export function crearProgresoInicial(hoyISO: string = FECHA_SEMILLA_SSR): ProgresoAlumno {
  return {
    alias: "Alan Camacho",
    avatar: "👽",
    rachaDias: 3,
    ultimaFechaISO: hoyISO,
    nodosCompletados: ["nodo-1-entorno", "nodo-2-node"],
    checklistMarcados: {
      "nodo-1-entorno": ["c1-1", "c1-2", "c1-3"],
      "nodo-2-node": ["c2-1", "c2-2", "c2-3"],
      "nodo-3-nextjs": ["c3-1"],
    },
    respuestasCorrectas: ["nodo-1-entorno", "nodo-2-node"],
    recursosRevisados: ["rec-1", "rec-4"],
    entregablesMarcados: {
      "proy-1-ui": ["ent-1"],
    },
  };
}
