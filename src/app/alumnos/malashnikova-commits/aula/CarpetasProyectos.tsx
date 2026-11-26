"use client";

import { useEffect, useState } from "react";
import { playLevelUp, playPop, playToggle } from "../sonidos";
import {
  BOTON_ACENTO,
  BOTON_CLARO,
  FISICA_TACTIL,
  FOCO_ACCESIBLE,
  INPUT_BASE,
  SUBTARJETA,
} from "../temaSketch";
import type {
  CarpetaFuentes,
  NodoTemario,
  ProgresoAlumno,
  ProyectoAula,
  RecursoFuente,
  TipoRecurso,
} from "./types";

interface CarpetasProyectosProps {
  carpetas: CarpetaFuentes[];
  proyectos: ProyectoAula[];
  nodos: NodoTemario[];
  progreso: ProgresoAlumno;
  hoyISO: string;
  modoEdicionDocente: boolean;
  carpetaActivaId: string | null;
  proyectoDestacadoId: string | null;
  onSeleccionarCarpeta: (id: string | null) => void;
  onAlternarRecursoRevisado: (recursoId: string) => void;
  onAlternarEntregableProyecto: (
    proyectoId: string,
    entregableId: string,
    totalEntregables: number
  ) => void;
  onIrANodo: (nodoId: string) => void;
  onCrearCarpetaDocente: (carpeta: CarpetaFuentes) => void;
  onEliminarCarpetaDocente: (carpetaId: string) => void;
  onAlternarVinculoCarpetaNodoDocente: (carpetaId: string, nodoId: string) => void;
  onAgregarRecursoDocente: (carpetaId: string, recurso: RecursoFuente) => void;
  onEliminarRecursoDocente: (carpetaId: string, recursoId: string) => void;
  onGuardarProyectoDocente: (proyecto: ProyectoAula, esNuevo: boolean) => void;
  onEliminarProyectoDocente: (proyectoId: string) => void;
}

const TIPOS_RECURSO: TipoRecurso[] = ["Apunte", "Enlace", "Guía", "Ejercicio"];

export function CarpetasProyectos({
  carpetas,
  proyectos,
  nodos,
  progreso,
  hoyISO,
  modoEdicionDocente,
  carpetaActivaId,
  proyectoDestacadoId,
  onSeleccionarCarpeta,
  onAlternarRecursoRevisado,
  onAlternarEntregableProyecto,
  onIrANodo,
  onCrearCarpetaDocente,
  onEliminarCarpetaDocente,
  onAlternarVinculoCarpetaNodoDocente,
  onAgregarRecursoDocente,
  onEliminarRecursoDocente,
  onGuardarProyectoDocente,
  onEliminarProyectoDocente,
}: CarpetasProyectosProps) {
  const [filtroNodoId, setFiltroNodoId] = useState<string>("");
  const [carpetasExpandidas, setCarpetasExpandidas] = useState<Record<string, boolean>>({});
  const [proyectosExpandidos, setProyectosExpandidos] = useState<Record<string, boolean>>({});

  // Formularios Docente ocultos bajo demanda
  const [mostrarFormCarpeta, setMostrarFormCarpeta] = useState(false);
  const [nombreCarpeta, setNombreCarpeta] = useState("");
  const [emojiCarpeta, setEmojiCarpeta] = useState("📂");
  const [descCarpeta, setDescCarpeta] = useState("");

  const [carpetaParaRecursoId, setCarpetaParaRecursoId] = useState<string | null>(null);
  const [tituloRec, setTituloRec] = useState("");
  const [tipoRec, setTipoRec] = useState<TipoRecurso>("Apunte");
  const [resumenRec, setResumenRec] = useState("");
  const [urlRec, setUrlRec] = useState("");
  const [errorUrlRec, setErrorUrlRec] = useState<string | null>(null);

  const [editandoProy, setEditandoProy] = useState<ProyectoAula | null>(null);
  const [esNuevoProy, setEsNuevoProy] = useState(false);
  const [nuevoEntregableTexto, setNuevoEntregableTexto] = useState("");

  // Si se navega desde un nodo o calendario, expandir automáticamente ese elemento
  useEffect(() => {
    if (carpetaActivaId) {
      setCarpetasExpandidas((prev) => ({ ...prev, [carpetaActivaId]: true }));
    }
  }, [carpetaActivaId]);

  useEffect(() => {
    if (proyectoDestacadoId) {
      setProyectosExpandidos((prev) => ({ ...prev, [proyectoDestacadoId]: true }));
    }
  }, [proyectoDestacadoId]);

  const carpetasFiltradas = carpetas.filter(
    (c) => !filtroNodoId || c.nodoIds.includes(filtroNodoId)
  );

  const alternarCarpeta = (id: string) => {
    const siguiente = !carpetasExpandidas[id];
    playToggle(siguiente);
    setCarpetasExpandidas((prev) => ({ ...prev, [id]: siguiente }));
    onSeleccionarCarpeta(siguiente ? id : null);
  };

  const alternarProyecto = (id: string) => {
    const siguiente = !proyectosExpandidos[id];
    playToggle(siguiente);
    setProyectosExpandidos((prev) => ({ ...prev, [id]: siguiente }));
  };

  const crearCarpeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCarpeta.trim()) return;
    playLevelUp(70);
    onCrearCarpetaDocente({
      id: `carpeta-${Date.now()}`,
      nombre: nombreCarpeta.trim(),
      emoji: emojiCarpeta || "📂",
      descripcion: descCarpeta.trim(),
      nodoIds: [],
      recursos: [],
    });
    setNombreCarpeta("");
    setDescCarpeta("");
    setMostrarFormCarpeta(false);
  };

  const guardarRecurso = (e: React.FormEvent, carpetaId: string) => {
    e.preventDefault();
    if (!tituloRec.trim()) return;
    const urlLimpia = urlRec.trim();
    if (urlLimpia && !urlLimpia.startsWith("https://")) {
      setErrorUrlRec("La URL debe comenzar con https://");
      playToggle(false);
      return;
    }

    playPop();
    onAgregarRecursoDocente(carpetaId, {
      id: `rec-${Date.now()}`,
      titulo: tituloRec.trim(),
      tipo: tipoRec,
      resumen: resumenRec.trim(),
      url: urlLimpia || undefined,
    });
    setTituloRec("");
    setResumenRec("");
    setUrlRec("");
    setErrorUrlRec(null);
    setCarpetaParaRecursoId(null);
  };

  const iniciarNuevoProyecto = () => {
    playToggle(true);
    setEsNuevoProy(true);
    setEditandoProy({
      id: `proy-${Date.now()}`,
      titulo: "Nuevo proyecto",
      emoji: "🛠️",
      descripcion: "",
      fechaInicio: hoyISO,
      fechaLimite: hoyISO,
      xpExtra: 100,
      nodoIds: [],
      entregables: [{ id: `ent-${Date.now()}`, texto: "Entregable verificable" }],
    });
  };

  return (
    <div className="space-y-8">
      {/* ═══════════════ CARPETAS DE FUENTES (ACORDEONES CONTRAÍBLES) ═══════════════ */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-black text-[#123850]">📂 Carpetas de Fuentes</h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar carpetas por nodo"
              value={filtroNodoId}
              onChange={(e) => {
                playPop();
                setFiltroNodoId(e.target.value);
              }}
              className={`py-1 font-mono text-xs ${INPUT_BASE}`}
            >
              <option value="">Todos los nodos</option>
              {nodos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.titulo}
                </option>
              ))}
            </select>

            {modoEdicionDocente && (
              <button
                type="button"
                onClick={() => {
                  const sig = !mostrarFormCarpeta;
                  playToggle(sig);
                  setMostrarFormCarpeta(sig);
                }}
                aria-expanded={mostrarFormCarpeta}
                className={`px-3.5 py-1 font-mono text-xs font-black ${BOTON_ACENTO}`}
              >
                + Carpeta
              </button>
            )}
          </div>
        </div>

        {modoEdicionDocente && mostrarFormCarpeta && (
          <form
            onSubmit={crearCarpeta}
            className={`${SUBTARJETA} grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-4`}
          >
            <input
              type="text"
              required
              placeholder="Nombre…"
              value={nombreCarpeta}
              onChange={(e) => setNombreCarpeta(e.target.value)}
              className={INPUT_BASE}
            />
            <input
              type="text"
              maxLength={6}
              placeholder="Emoji"
              value={emojiCarpeta}
              onChange={(e) => setEmojiCarpeta(e.target.value)}
              className={`text-center ${INPUT_BASE}`}
            />
            <input
              type="text"
              placeholder="Descripción opcional…"
              value={descCarpeta}
              onChange={(e) => setDescCarpeta(e.target.value)}
              className={INPUT_BASE}
            />
            <button type="submit" className={`px-4 py-1.5 font-mono text-xs font-black ${BOTON_ACENTO}`}>
              Crear
            </button>
          </form>
        )}

        <div className="space-y-3">
          {carpetasFiltradas.map((carpeta) => {
            const expandida = Boolean(carpetasExpandidas[carpeta.id]);
            const revisadosCount = carpeta.recursos.filter((r) =>
              progreso.recursosRevisados.includes(r.id)
            ).length;

            return (
              <article key={carpeta.id} className={`${SUBTARJETA} overflow-hidden`}>
                {/* Cabecera resumida */}
                <div className="flex items-center justify-between gap-2 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => alternarCarpeta(carpeta.id)}
                    aria-expanded={expandida}
                    className={`flex flex-1 cursor-pointer items-center justify-between gap-3 text-left ${FOCO_ACCESIBLE}`}
                  >
                    <span className="text-base font-black text-[#123850]">
                      {carpeta.emoji} {carpeta.nombre}
                    </span>
                    <span className="font-mono text-xs font-black text-[#123850]/70">
                      {revisadosCount}/{carpeta.recursos.length} {expandida ? "▲" : "▼"}
                    </span>
                  </button>

                  {modoEdicionDocente && (
                    <button
                      type="button"
                      onClick={() => {
                        playToggle(false);
                        onEliminarCarpetaDocente(carpeta.id);
                      }}
                      aria-label={`Eliminar carpeta ${carpeta.nombre}`}
                      className="ml-2 cursor-pointer rounded-lg border border-[#123850] px-2 py-0.5 font-mono text-xs font-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Contenido interno desplegable */}
                {expandida && (
                  <div className="space-y-4 border-t-2 border-dashed border-[#123850]/30 p-5">
                    {carpeta.descripcion && (
                      <p className="text-xs font-semibold text-[#123850]/70">
                        {carpeta.descripcion}
                      </p>
                    )}

                    {/* Vínculos con nodos */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {modoEdicionDocente
                        ? nodos.map((n) => {
                            const activo = carpeta.nodoIds.includes(n.id);
                            return (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => {
                                  playToggle(!activo);
                                  onAlternarVinculoCarpetaNodoDocente(carpeta.id, n.id);
                                }}
                                aria-pressed={activo}
                                className={`px-2.5 py-0.5 font-mono text-[11px] font-black ${
                                  activo ? BOTON_ACENTO : BOTON_CLARO
                                }`}
                              >
                                {n.titulo} {activo ? "✓" : "+"}
                              </button>
                            );
                          })
                        : nodos
                            .filter((n) => carpeta.nodoIds.includes(n.id))
                            .map((n) => (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => {
                                  playPop();
                                  onIrANodo(n.id);
                                }}
                                className={`px-2.5 py-0.5 font-mono text-[11px] font-black ${BOTON_CLARO}`}
                              >
                                {n.titulo} →
                              </button>
                            ))}

                      {modoEdicionDocente && (
                        <button
                          type="button"
                          onClick={() => {
                            const abrir = carpetaParaRecursoId !== carpeta.id;
                            playToggle(abrir);
                            setErrorUrlRec(null);
                            setCarpetaParaRecursoId(abrir ? carpeta.id : null);
                          }}
                          aria-expanded={carpetaParaRecursoId === carpeta.id}
                          className={`ml-auto px-3 py-0.5 font-mono text-xs font-black ${BOTON_ACENTO}`}
                        >
                          + Recurso
                        </button>
                      )}
                    </div>

                    {modoEdicionDocente && carpetaParaRecursoId === carpeta.id && (
                      <form
                        onSubmit={(e) => guardarRecurso(e, carpeta.id)}
                        className="space-y-2.5 rounded-xl border-2 border-dashed border-[#123850]/30 p-3.5"
                      >
                        {errorUrlRec && (
                          <p className="font-mono text-xs font-black text-[#123850]">
                            {errorUrlRec}
                          </p>
                        )}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <input
                            type="text"
                            required
                            placeholder="Título…"
                            value={tituloRec}
                            onChange={(e) => setTituloRec(e.target.value)}
                            className={`sm:col-span-2 ${INPUT_BASE}`}
                          />
                          <select
                            value={tipoRec}
                            onChange={(e) => setTipoRec(e.target.value as TipoRecurso)}
                            className={`font-mono text-xs ${INPUT_BASE}`}
                          >
                            {TIPOS_RECURSO.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Resumen breve…"
                          value={resumenRec}
                          onChange={(e) => setResumenRec(e.target.value)}
                          className={`w-full ${INPUT_BASE}`}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="url"
                            placeholder="https://enlace-opcional..."
                            value={urlRec}
                            onChange={(e) => {
                              setUrlRec(e.target.value);
                              setErrorUrlRec(null);
                            }}
                            className={`flex-1 font-mono text-xs ${INPUT_BASE}`}
                          />
                          <button
                            type="submit"
                            className={`px-4 py-1.5 font-mono text-xs font-black ${BOTON_ACENTO}`}
                          >
                            Guardar
                          </button>
                        </div>
                      </form>
                    )}

                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {carpeta.recursos.map((rec) => {
                        const revisado = progreso.recursosRevisados.includes(rec.id);
                        return (
                          <li
                            key={rec.id}
                            className={`flex flex-col justify-between gap-3 rounded-xl border-2 border-[#123850] p-3.5 ${
                              revisado ? "bg-[#D69A3F]/20" : "bg-[#FEFEFA]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-md border border-[#123850] px-2 py-0.5 font-mono text-[10px] font-black">
                                  {rec.tipo}
                                </span>
                                {modoEdicionDocente && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playToggle(false);
                                      onEliminarRecursoDocente(carpeta.id, rec.id);
                                    }}
                                    aria-label={`Eliminar ${rec.titulo}`}
                                    className="cursor-pointer font-mono text-xs font-black"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              <p className="mt-1.5 text-sm font-black">{rec.titulo}</p>
                              {rec.resumen && (
                                <p className="mt-1 text-xs font-medium text-[#123850]/70">
                                  {rec.resumen}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  playPop();
                                  onAlternarRecursoRevisado(rec.id);
                                }}
                                aria-pressed={revisado}
                                className={`px-3 py-1 font-mono text-xs font-black ${
                                  revisado ? BOTON_ACENTO : BOTON_CLARO
                                }`}
                              >
                                {revisado ? "✓ Leído" : "Marcar leído"}
                              </button>

                              {rec.url && rec.url.startsWith("https://") && (
                                <a
                                  href={rec.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-mono text-xs font-black underline decoration-[#D69A3F] decoration-2 ${FOCO_ACCESIBLE}`}
                                >
                                  Abrir ↗
                                </a>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ PROYECTOS (ACORDEONES CONTRAÍBLES) ═══════════════ */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-black text-[#123850]">🚀 Proyectos</h3>

          {modoEdicionDocente && !editandoProy && (
            <button
              type="button"
              onClick={iniciarNuevoProyecto}
              className={`px-3.5 py-1 font-mono text-xs font-black ${BOTON_ACENTO}`}
            >
              + Proyecto
            </button>
          )}
        </div>

        {modoEdicionDocente && editandoProy && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editandoProy.titulo.trim()) return;
              playLevelUp(80);
              onGuardarProyectoDocente(editandoProy, esNuevoProy);
              setEditandoProy(null);
            }}
            className={`${SUBTARJETA} space-y-3 p-5`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black">
                {esNuevoProy ? "Nuevo proyecto" : editandoProy.titulo}
              </h4>
              <button
                type="button"
                onClick={() => {
                  playToggle(false);
                  setEditandoProy(null);
                }}
                className={`px-2.5 py-0.5 font-mono text-xs font-black ${BOTON_CLARO}`}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
              <input
                type="text"
                required
                value={editandoProy.titulo}
                onChange={(e) => setEditandoProy({ ...editandoProy, titulo: e.target.value })}
                placeholder="Título"
                className={`sm:col-span-2 ${INPUT_BASE}`}
              />
              <input
                type="date"
                value={editandoProy.fechaLimite}
                onChange={(e) => setEditandoProy({ ...editandoProy, fechaLimite: e.target.value })}
                className={`font-mono text-xs ${INPUT_BASE}`}
              />
              <input
                type="number"
                min={20}
                max={500}
                step={10}
                value={editandoProy.xpExtra}
                onChange={(e) =>
                  setEditandoProy({ ...editandoProy, xpExtra: Number(e.target.value) || 100 })
                }
                className={`font-mono text-xs ${INPUT_BASE}`}
              />
            </div>

            <textarea
              rows={2}
              placeholder="Descripción…"
              value={editandoProy.descripcion}
              onChange={(e) => setEditandoProy({ ...editandoProy, descripcion: e.target.value })}
              className={`w-full ${INPUT_BASE}`}
            />

            <div className="space-y-1.5">
              {editandoProy.entregables.map((ent) => (
                <div
                  key={ent.id}
                  className="flex items-center justify-between rounded-xl border-2 border-[#123850]/30 px-3 py-1 text-xs font-bold"
                >
                  <span>{ent.texto}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditandoProy({
                        ...editandoProy,
                        entregables: editandoProy.entregables.filter((x) => x.id !== ent.id),
                      })
                    }
                    className="cursor-pointer font-mono text-xs font-black"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoEntregableTexto}
                  onChange={(e) => setNuevoEntregableTexto(e.target.value)}
                  placeholder="Nuevo entregable…"
                  className={`flex-1 ${INPUT_BASE}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!nuevoEntregableTexto.trim()) return;
                    playPop();
                    setEditandoProy({
                      ...editandoProy,
                      entregables: [
                        ...editandoProy.entregables,
                        { id: `ent-${Date.now()}`, texto: nuevoEntregableTexto.trim() },
                      ],
                    });
                    setNuevoEntregableTexto("");
                  }}
                  className={`px-3 py-1 font-mono text-xs font-black ${BOTON_CLARO}`}
                >
                  + Añadir
                </button>
              </div>
            </div>

            <button type="submit" className={`px-5 py-1.5 font-mono text-xs font-black ${BOTON_ACENTO}`}>
              Guardar proyecto
            </button>
          </form>
        )}

        <div className="space-y-3">
          {proyectos.map((proy) => {
            const expandido = Boolean(proyectosExpandidos[proy.id]);
            const marcados = progreso.entregablesMarcados[proy.id] ?? [];
            const totalEnt = proy.entregables.length;
            const pct = totalEnt > 0 ? Math.round((marcados.length / totalEnt) * 100) : 0;

            return (
              <article key={proy.id} className={`${SUBTARJETA} overflow-hidden`}>
                {/* Vista resumida limpia */}
                <button
                  type="button"
                  onClick={() => alternarProyecto(proy.id)}
                  aria-expanded={expandido}
                  className={`flex w-full cursor-pointer flex-col gap-2.5 px-5 py-4 text-left ${FOCO_ACCESIBLE}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-black text-[#123850]">
                      {proy.emoji} {proy.titulo}
                    </span>
                    <span className="font-mono text-xs font-black text-[#123850]/70">
                      {proy.fechaLimite} · +{proy.xpExtra} XP {expandido ? "▲" : "▼"}
                    </span>
                  </div>

                  <div
                    className="h-3 w-full overflow-hidden rounded-full border-2 border-[#123850] bg-[#123850]/10 p-0.5"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Avance de ${proy.titulo}`}
                  >
                    <div
                      className="h-full rounded-full bg-[#D69A3F] transition-all duration-300 ease-out motion-reduce:transition-none"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>

                {/* Detalle desplegable */}
                {expandido && (
                  <div className="space-y-3 border-t-2 border-dashed border-[#123850]/30 p-5">
                    {proy.descripcion && (
                      <p className="text-xs font-semibold leading-relaxed text-[#123850]/70">
                        {proy.descripcion}
                      </p>
                    )}

                    <ul className="space-y-2">
                      {proy.entregables.map((ent) => {
                        const hecho = marcados.includes(ent.id);
                        return (
                          <li key={ent.id}>
                            <button
                              type="button"
                              onClick={() => {
                                const nuevoConteo = hecho ? marcados.length - 1 : marcados.length + 1;
                                if (!hecho && nuevoConteo >= totalEnt) playLevelUp(100);
                                else playPop();
                                onAlternarEntregableProyecto(proy.id, ent.id, totalEnt);
                              }}
                              aria-pressed={hecho}
                              className={`flex w-full items-center gap-2.5 rounded-xl border-2 border-[#123850] px-3 py-2 text-left text-xs font-bold ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
                                hecho ? "bg-[#D69A3F]/20" : "bg-[#FEFEFA]"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#123850] font-mono text-[10px] font-black ${
                                  hecho ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
                                }`}
                              >
                                {hecho ? "✓" : ""}
                              </span>
                              <span className={hecho ? "line-through opacity-75" : ""}>
                                {ent.texto}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {modoEdicionDocente && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playToggle(true);
                            setEsNuevoProy(false);
                            setEditandoProy({
                              ...proy,
                              entregables: proy.entregables.map((x) => ({ ...x })),
                            });
                          }}
                          className={`px-3 py-1 font-mono text-xs font-black ${BOTON_ACENTO}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playToggle(false);
                            onEliminarProyectoDocente(proy.id);
                          }}
                          aria-label={`Eliminar proyecto ${proy.titulo}`}
                          className={`px-3 py-1 font-mono text-xs font-black ${BOTON_CLARO}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
