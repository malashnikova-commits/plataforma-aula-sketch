export type RolUsuario = "alumnado" | "docente";

export type EstadoVisualNodo = "bloqueado" | "disponible" | "en_progreso" | "completado";

export type TipoRecurso = "Apunte" | "Enlace" | "Guía" | "Ejercicio";

export interface RecursoFuente {
  id: string;
  titulo: string;
  tipo: TipoRecurso;
  resumen: string;
  url?: string;
}

export interface CarpetaFuentes {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  nodoIds: string[];
  recursos: RecursoFuente[];
}

export interface EntregableProyecto {
  id: string;
  texto: string;
}

export interface ProyectoAula {
  id: string;
  titulo: string;
  emoji: string;
  descripcion: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaLimite: string; // YYYY-MM-DD
  xpExtra: number;
  nodoIds: string[];
  entregables: EntregableProyecto[];
}

export interface PasoChecklistNodo {
  id: string;
  texto: string;
}

export interface PreguntaRapidaNodo {
  pregunta: string;
  opciones: string[];
  indiceCorrecto: number;
}

export interface NodoTemario {
  id: string;
  orden: number;
  unidad: string;
  titulo: string;
  descripcion: string;
  emoji: string;
  xp: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaLimite: string; // YYYY-MM-DD
  tiempoEstimado: string;
  prerequisitoId: string | null;
  carpetasIds: string[];
  proyectoId: string | null;
  bloqueoPorFecha: boolean;
  desbloqueoManual: boolean;
  visible: boolean;
  checklist: PasoChecklistNodo[];
  preguntaRapida?: PreguntaRapidaNodo;
}

export interface ProgresoAlumno {
  alias: string;
  avatar: string;
  rachaDias: number;
  ultimaFechaISO: string;
  nodosCompletados: string[];
  checklistMarcados: Record<string, string[]>;
  respuestasCorrectas: string[];
  recursosRevisados: string[];
  entregablesMarcados: Record<string, string[]>;
}

export interface ConfiguracionCurso {
  version: number;
  nombreCurso: string;
  subtitulo: string;
  pinDocente: string;
  nodos: NodoTemario[];
  carpetas: CarpetaFuentes[];
  proyectos: ProyectoAula[];
}

export type TipoEventoCalendario = "inicio_nodo" | "limite_nodo" | "entrega_proyecto";

export type SemaforoPlazo = "completado" | "en_curso" | "vence_pronto" | "proximo" | "atrasado";

export interface EventoCalendario {
  id: string;
  fecha: string; // YYYY-MM-DD
  tipo: TipoEventoCalendario;
  titulo: string;
  subtitulo: string;
  emoji: string;
  xp: number;
  referenciaId: string;
  completado: boolean;
  semaforo: SemaforoPlazo;
}

export interface EstadoAula {
  rolActual: RolUsuario;
  docenteAutenticado: boolean;
  vistaPreviaAlumno: boolean;
  curso: ConfiguracionCurso;
  progreso: ProgresoAlumno;
}
