"use client";

import { useState } from "react";
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
  EstadoVisualNodo,
  NodoTemario,
  ProgresoAlumno,
  ProyectoAula,
} from "./types";

interface MapaNodosProps {
  nodos: NodoTemario[];
  carpetas: CarpetaFuentes[];
  proyectos: ProyectoAula[];
  progreso: ProgresoAlumno;
  hoyISO: string;
  modoEdicionDocente: boolean;
  nodoSeleccionadoId: string | null;
  onSeleccionarNodo: (id: string | null) => void;
  onAlternarPasoChecklist: (nodoId: string, pasoId: string) => void;
  onResponderQuiz: (nodoId: string) => void;
  onAlternarCompletadoNodo: (nodoId: string, completar: boolean) => void;
  onIrACarpeta: (carpetaId: string) => void;
  onIrAProyecto: (proyectoId: string) => void;
  onGuardarNodoDocente: (nodo: NodoTemario, esNuevo: boolean) => void;
  onEliminarNodoDocente: (nodoId: string) => void;
  onMoverNodoDocente: (nodoId: string, direccion: -1 | 1) => void;
}

const CLASES_ZIGZAG = [
  "translate-x-0",
  "sm:translate-x-12 translate-x-4",
  "translate-x-0",
  "sm:-translate-x-12 -translate-x-4",
];

export function calcularEstadoNodo(
  nodo: NodoTemario,
  todosNodos: NodoTemario[],
  progreso: ProgresoAlumno,
  hoyISO: string
): { estado: EstadoVisualNodo; motivoBloqueo?: string } {
  if (progreso.nodosCompletados.includes(nodo.id)) {
    return { estado: "completado" };
  }

  if (!nodo.desbloqueoManual) {
    if (nodo.prerequisitoId) {
      const prereq = todosNodos.find((n) => n.id === nodo.prerequisitoId);
      if (prereq && prereq.visible && !progreso.nodosCompletados.includes(prereq.id)) {
        return {
          estado: "bloqueado",
          motivoBloqueo: `Requiere "${prereq.titulo}"`,
        };
      }
    }
    if (nodo.bloqueoPorFecha && hoyISO < nodo.fechaInicio) {
      return {
        estado: "bloqueado",
        motivoBloqueo: `Abre el ${nodo.fechaInicio}`,
      };
    }
  }

  const marcados = progreso.checklistMarcados[nodo.id] ?? [];
  if (marcados.length > 0) {
    return { estado: "en_progreso" };
  }

  return { estado: "disponible" };
}

export function MapaNodos({
  nodos,
  carpetas,
  proyectos,
  progreso,
  hoyISO,
  modoEdicionDocente,
  nodoSeleccionadoId,
  onSeleccionarNodo,
  onAlternarPasoChecklist,
  onResponderQuiz,
  onAlternarCompletadoNodo,
  onIrACarpeta,
  onIrAProyecto,
  onGuardarNodoDocente,
  onEliminarNodoDocente,
  onMoverNodoDocente,
}: MapaNodosProps) {
  const [editandoNodo, setEditandoNodo] = useState<NodoTemario | null>(null);
  const [esNuevoNodo, setEsNuevoNodo] = useState<boolean>(false);
  const [nuevoPasoTexto, setNuevoPasoTexto] = useState<string>("");
  const [opcionElegidaQuiz, setOpcionElegidaQuiz] = useState<Record<string, number>>({});

  const nodosOrdenados = [...nodos]
    .sort((a, b) => a.orden - b.orden)
    .filter((n) => modoEdicionDocente || n.visible);

  const nodoActivo = nodosOrdenados.find((n) => n.id === nodoSeleccionadoId) ?? null;

  const abrirFormularioNuevo = () => {
    playToggle(true);
    const ultimo = nodosOrdenados[nodosOrdenados.length - 1];
    setEsNuevoNodo(true);
    setEditandoNodo({
      id: `nodo-${Date.now()}`,
      orden: nodos.length + 1,
      unidad: ultimo?.unidad ?? "Unidad",
      titulo: "Nuevo nodo",
      descripcion: "",
      emoji: "⭐",
      xp: 80,
      fechaInicio: hoyISO,
      fechaLimite: hoyISO,
      tiempoEstimado: "1 h",
      prerequisitoId: ultimo?.id ?? null,
      carpetasIds: [],
      proyectoId: null,
      bloqueoPorFecha: false,
      desbloqueoManual: false,
      visible: true,
      checklist: [{ id: `chk-${Date.now()}`, texto: "Actividad práctica" }],
    });
  };

  const abrirFormularioEdicion = (nodo: NodoTemario) => {
    playToggle(true);
    setEsNuevoNodo(false);
    setEditandoNodo({
      ...nodo,
      carpetasIds: [...nodo.carpetasIds],
      checklist: nodo.checklist.map((c) => ({ ...c })),
    });
  };

  const guardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoNodo || !editandoNodo.titulo.trim()) return;
    playLevelUp(75);
    onGuardarNodoDocente(editandoNodo, esNuevoNodo);
    setEditandoNodo(null);
  };

  const alternarNodo = (id: string) => {
    const siguiente = nodoSeleccionadoId === id ? null : id;
    playToggle(Boolean(siguiente));
    onSeleccionarNodo(siguiente);
  };

  return (
    <div className="space-y-5">
      {/* Botón Docente bajo demanda */}
      {modoEdicionDocente && !editandoNodo && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={abrirFormularioNuevo}
            className={`px-4 py-1.5 font-mono text-xs font-black ${BOTON_ACENTO}`}
          >
            + Nuevo nodo
          </button>
        </div>
      )}

      {/* Formulario Docente oculto hasta invocar */}
      {modoEdicionDocente && editandoNodo && (
        <form onSubmit={guardarEdicion} className={`${SUBTARJETA} space-y-4 p-5`}>
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#123850]/30 pb-3">
            <h3 className="text-base font-black text-[#123850]">
              {esNuevoNodo ? "Nuevo nodo" : editandoNodo.titulo}
            </h3>
            <button
              type="button"
              onClick={() => {
                playToggle(false);
                setEditandoNodo(null);
              }}
              aria-label="Cerrar formulario de nodo"
              className={`px-2.5 py-0.5 font-mono text-xs font-black ${BOTON_CLARO}`}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-black">Título</label>
              <input
                type="text"
                required
                value={editandoNodo.titulo}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, titulo: e.target.value })}
                className={`w-full ${INPUT_BASE}`}
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs font-black">Emoji</label>
              <input
                type="text"
                maxLength={6}
                value={editandoNodo.emoji}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, emoji: e.target.value })}
                className={`w-full text-center ${INPUT_BASE}`}
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs font-black">XP</label>
              <input
                type="number"
                min={10}
                max={500}
                step={10}
                value={editandoNodo.xp}
                onChange={(e) =>
                  setEditandoNodo({ ...editandoNodo, xp: Math.max(10, Number(e.target.value) || 50) })
                }
                className={`w-full font-mono ${INPUT_BASE}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block font-mono text-xs font-black">Unidad</label>
              <input
                type="text"
                value={editandoNodo.unidad}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, unidad: e.target.value })}
                className={`w-full ${INPUT_BASE}`}
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs font-black">Inicio</label>
              <input
                type="date"
                value={editandoNodo.fechaInicio}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, fechaInicio: e.target.value })}
                className={`w-full font-mono ${INPUT_BASE}`}
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs font-black">Límite</label>
              <input
                type="date"
                value={editandoNodo.fechaLimite}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, fechaLimite: e.target.value })}
                className={`w-full font-mono ${INPUT_BASE}`}
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs font-black">Duración</label>
              <input
                type="text"
                value={editandoNodo.tiempoEstimado}
                onChange={(e) =>
                  setEditandoNodo({ ...editandoNodo, tiempoEstimado: e.target.value })
                }
                className={`w-full font-mono ${INPUT_BASE}`}
              />
            </div>
          </div>

          <textarea
            rows={2}
            placeholder="Objetivo del nodo…"
            value={editandoNodo.descripcion}
            onChange={(e) => setEditandoNodo({ ...editandoNodo, descripcion: e.target.value })}
            className={`w-full ${INPUT_BASE}`}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              aria-label="Nodo prerequisito"
              value={editandoNodo.prerequisitoId ?? ""}
              onChange={(e) =>
                setEditandoNodo({
                  ...editandoNodo,
                  prerequisitoId: e.target.value ? e.target.value : null,
                })
              }
              className={INPUT_BASE}
            >
              <option value="">Sin prerequisito</option>
              {nodos
                .filter((n) => n.id !== editandoNodo.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    Prerequisito: {n.titulo}
                  </option>
                ))}
            </select>

            <select
              aria-label="Proyecto asociado"
              value={editandoNodo.proyectoId ?? ""}
              onChange={(e) =>
                setEditandoNodo({
                  ...editandoNodo,
                  proyectoId: e.target.value ? e.target.value : null,
                })
              }
              className={INPUT_BASE}
            >
              <option value="">Sin proyecto asociado</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  Proyecto: {p.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {carpetas.map((c) => {
              const vinculada = editandoNodo.carpetasIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playToggle(!vinculada);
                    const nuevas = vinculada
                      ? editandoNodo.carpetasIds.filter((id) => id !== c.id)
                      : [...editandoNodo.carpetasIds, c.id];
                    setEditandoNodo({ ...editandoNodo, carpetasIds: nuevas });
                  }}
                  aria-pressed={vinculada}
                  className={`px-3 py-1 font-mono text-xs font-black ${
                    vinculada ? BOTON_ACENTO : BOTON_CLARO
                  }`}
                >
                  {c.nombre} {vinculada ? "✓" : "+"}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={editandoNodo.bloqueoPorFecha}
                onChange={(e) =>
                  setEditandoNodo({ ...editandoNodo, bloqueoPorFecha: e.target.checked })
                }
                className="accent-[#123850]"
              />
              <span>Bloquear por fecha</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={editandoNodo.desbloqueoManual}
                onChange={(e) =>
                  setEditandoNodo({ ...editandoNodo, desbloqueoManual: e.target.checked })
                }
                className="accent-[#123850]"
              />
              <span>Desbloqueo manual</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={editandoNodo.visible}
                onChange={(e) => setEditandoNodo({ ...editandoNodo, visible: e.target.checked })}
                className="accent-[#123850]"
              />
              <span>Visible</span>
            </label>
          </div>

          <div className="space-y-2">
            <ul className="space-y-1.5">
              {editandoNodo.checklist.map((paso) => (
                <li
                  key={paso.id}
                  className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#123850]/30 px-3 py-1 text-xs font-bold"
                >
                  <span>{paso.texto}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditandoNodo({
                        ...editandoNodo,
                        checklist: editandoNodo.checklist.filter((c) => c.id !== paso.id),
                      })
                    }
                    className="cursor-pointer font-mono text-xs font-black"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoPasoTexto}
                onChange={(e) => setNuevoPasoTexto(e.target.value)}
                placeholder="Nueva actividad…"
                className={`flex-1 ${INPUT_BASE}`}
              />
              <button
                type="button"
                onClick={() => {
                  if (!nuevoPasoTexto.trim()) return;
                  playPop();
                  setEditandoNodo({
                    ...editandoNodo,
                    checklist: [
                      ...editandoNodo.checklist,
                      { id: `chk-${Date.now()}`, texto: nuevoPasoTexto.trim() },
                    ],
                  });
                  setNuevoPasoTexto("");
                }}
                className={`px-3 py-1 font-mono text-xs font-black ${BOTON_CLARO}`}
              >
                + Añadir
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className={`px-5 py-2 font-mono text-xs font-black ${BOTON_ACENTO}`}>
              Guardar nodo
            </button>
          </div>
        </form>
      )}

      {/* Contenedor del Mapa + Panel desplegable solo cuando hay nodo seleccionado */}
      <div className={`grid grid-cols-1 gap-6 ${nodoActivo ? "lg:grid-cols-12" : ""}`}>
        <div
          className={`${SUBTARJETA} flex flex-col items-center p-6 ${
            nodoActivo ? "lg:col-span-6" : ""
          }`}
        >
          {nodosOrdenados.map((nodo, idx) => {
            const { estado } = calcularEstadoNodo(nodo, nodos, progreso, hoyISO);
            const seleccionado = nodoActivo?.id === nodo.id;
            const claseZigZag = CLASES_ZIGZAG[idx % CLASES_ZIGZAG.length];
            const mostrarUnidad = idx === 0 || nodosOrdenados[idx - 1].unidad !== nodo.unidad;

            return (
              <div key={nodo.id} className="flex w-full max-w-md flex-col items-center">
                {mostrarUnidad && (
                  <div className="my-3 flex w-full items-center gap-3">
                    <span className="h-[2px] flex-1 border-t-2 border-dashed border-[#123850]/30" />
                    <span className="font-mono text-[11px] font-black uppercase tracking-wider text-[#123850]/70">
                      {nodo.unidad}
                    </span>
                    <span className="h-[2px] flex-1 border-t-2 border-dashed border-[#123850]/30" />
                  </div>
                )}

                <div className={`my-1 flex flex-col items-center ${claseZigZag}`}>
                  <button
                    type="button"
                    onClick={() => alternarNodo(nodo.id)}
                    aria-expanded={seleccionado}
                    aria-label={`${nodo.titulo} (${estado})`}
                    className={`relative flex h-18 w-18 flex-col items-center justify-center rounded-full border-[3px] border-[#123850] ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
                      estado === "completado"
                        ? "bg-[#D69A3F] text-[#123850] shadow-[0_5px_0_#123850]"
                        : estado === "disponible"
                          ? "bg-[#FEFEFA] text-[#123850] shadow-[0_5px_0_#123850] ring-4 ring-[#D69A3F] animate-pulse motion-reduce:animate-none"
                          : estado === "en_progreso"
                            ? "bg-[#D69A3F]/20 text-[#123850] shadow-[0_5px_0_#123850]"
                            : "border-dashed bg-[#FEFEFA] text-[#123850]/70 shadow-[0_3px_0_#123850]"
                    } ${seleccionado ? "scale-105" : ""}`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {estado === "bloqueado"
                        ? "🔒"
                        : estado === "completado"
                          ? "✅"
                          : nodo.emoji}
                    </span>
                  </button>

                  <p
                    className={`mt-2 max-w-[180px] text-center text-xs font-black leading-snug ${
                      !nodo.visible ? "line-through opacity-60" : "text-[#123850]"
                    }`}
                  >
                    {nodo.titulo}
                  </p>

                  {modoEdicionDocente && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          onMoverNodoDocente(nodo.id, -1);
                        }}
                        disabled={idx === 0}
                        aria-label={`Subir ${nodo.titulo}`}
                        className="cursor-pointer rounded-lg border border-[#123850] bg-[#FEFEFA] px-1.5 py-0.5 font-mono text-[10px] font-black disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          onMoverNodoDocente(nodo.id, 1);
                        }}
                        disabled={idx === nodosOrdenados.length - 1}
                        aria-label={`Bajar ${nodo.titulo}`}
                        className="cursor-pointer rounded-lg border border-[#123850] bg-[#FEFEFA] px-1.5 py-0.5 font-mono text-[10px] font-black disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirFormularioEdicion(nodo)}
                        className="cursor-pointer rounded-lg border border-[#123850] bg-[#D69A3F] px-2 py-0.5 font-mono text-[10px] font-black"
                      >
                        Editar
                      </button>
                      {nodos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            playToggle(false);
                            onEliminarNodoDocente(nodo.id);
                          }}
                          aria-label={`Eliminar ${nodo.titulo}`}
                          className="cursor-pointer rounded-lg border border-[#123850] bg-[#FEFEFA] px-1.5 py-0.5 font-mono text-[10px] font-black"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {idx < nodosOrdenados.length - 1 && (
                  <svg
                    aria-hidden="true"
                    className="my-0.5 h-9 w-24 text-[#123850]"
                    viewBox="0 0 96 36"
                    fill="none"
                  >
                    <path
                      d={
                        idx % 2 === 0
                          ? "M 48 2 C 54 14, 72 20, 74 34"
                          : "M 74 2 C 70 16, 50 20, 48 34"
                      }
                      stroke={estado === "completado" ? "#D69A3F" : "#123850"}
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Detalle del nodo bajo demanda (se abre solo al hacer clic) */}
        {nodoActivo &&
          (() => {
            const { estado, motivoBloqueo } = calcularEstadoNodo(
              nodoActivo,
              nodos,
              progreso,
              hoyISO
            );
            const bloqueado = estado === "bloqueado" && !modoEdicionDocente;
            const pasosMarcados = progreso.checklistMarcados[nodoActivo.id] ?? [];
            const carpetasVinculadas = carpetas.filter((c) =>
              nodoActivo.carpetasIds.includes(c.id)
            );
            const proyectoVinculado = proyectos.find((p) => p.id === nodoActivo.proyectoId);
            const quizRespondido = progreso.respuestasCorrectas.includes(nodoActivo.id);
            const eleccionQuiz = opcionElegidaQuiz[nodoActivo.id];

            return (
              <article
                aria-live="polite"
                className={`${SUBTARJETA} space-y-4 p-5 lg:col-span-6 lg:sticky lg:top-20 lg:self-start`}
              >
                <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#123850]/30 pb-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#123850]/70">
                      {nodoActivo.fechaInicio} → {nodoActivo.fechaLimite} · {nodoActivo.tiempoEstimado}
                    </p>
                    <h3 className="mt-0.5 text-lg font-black text-[#123850]">
                      {nodoActivo.emoji} {nodoActivo.titulo}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playToggle(false);
                      onSeleccionarNodo(null);
                    }}
                    aria-label="Cerrar detalle del nodo"
                    className={`px-2.5 py-0.5 font-mono text-xs font-black ${BOTON_CLARO}`}
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm font-semibold leading-relaxed text-[#123850]">
                  {nodoActivo.descripcion}
                </p>

                {bloqueado ? (
                  <p className="rounded-xl border-2 border-dashed border-[#123850]/30 p-4 text-center font-mono text-xs font-bold text-[#123850]/70">
                    🔒 {motivoBloqueo ?? "Bloqueado"}
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {nodoActivo.checklist.map((paso) => {
                        const hecho = pasosMarcados.includes(paso.id);
                        return (
                          <li key={paso.id}>
                            <button
                              type="button"
                              onClick={() => {
                                playPop();
                                onAlternarPasoChecklist(nodoActivo.id, paso.id);
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
                                {paso.texto}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {nodoActivo.preguntaRapida && (
                      <div className="space-y-2 rounded-xl border-2 border-dashed border-[#123850]/30 p-3.5">
                        <p className="text-xs font-black text-[#123850]">
                          {nodoActivo.preguntaRapida.pregunta}
                        </p>
                        <div className="space-y-1.5">
                          {nodoActivo.preguntaRapida.opciones.map((op, i) => {
                            const esCorrecta = i === nodoActivo.preguntaRapida!.indiceCorrecto;
                            const fueElegida = eleccionQuiz === i;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setOpcionElegidaQuiz((prev) => ({
                                    ...prev,
                                    [nodoActivo.id]: i,
                                  }));
                                  if (esCorrecta) {
                                    playLevelUp(85);
                                    onResponderQuiz(nodoActivo.id);
                                  } else {
                                    playToggle(false);
                                  }
                                }}
                                className={`block w-full rounded-xl border-2 border-[#123850] px-3 py-1.5 text-left text-xs font-bold ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
                                  quizRespondido && esCorrecta
                                    ? "bg-[#D69A3F] text-[#123850]"
                                    : fueElegida && !esCorrecta
                                      ? "bg-[#123850] text-[#FEFEFA]"
                                      : "bg-[#FEFEFA] text-[#123850]"
                                }`}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(carpetasVinculadas.length > 0 || proyectoVinculado) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {carpetasVinculadas.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              playPop();
                              onIrACarpeta(c.id);
                            }}
                            className={`px-3 py-1 font-mono text-xs font-black ${BOTON_CLARO}`}
                          >
                            {c.emoji} {c.nombre} →
                          </button>
                        ))}

                        {proyectoVinculado && (
                          <button
                            type="button"
                            onClick={() => {
                              playPop();
                              onIrAProyecto(proyectoVinculado.id);
                            }}
                            className={`px-3 py-1 font-mono text-xs font-black ${BOTON_ACENTO}`}
                          >
                            {proyectoVinculado.emoji} {proyectoVinculado.titulo} →
                          </button>
                        )}
                      </div>
                    )}

                    <div className="pt-1">
                      {estado === "completado" ? (
                        <button
                          type="button"
                          onClick={() => {
                            playToggle(false);
                            onAlternarCompletadoNodo(nodoActivo.id, false);
                          }}
                          className={`w-full px-4 py-2 font-mono text-xs font-black ${BOTON_CLARO}`}
                        >
                          ✅ Completado · Reabrir
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            playLevelUp(100);
                            onAlternarCompletadoNodo(nodoActivo.id, true);
                          }}
                          className={`w-full px-4 py-2.5 font-mono text-xs font-black uppercase ${BOTON_ACENTO}`}
                        >
                          Completar (+{nodoActivo.xp} XP)
                        </button>
                      )}
                    </div>
                  </>
                )}
              </article>
            );
          })()}
      </div>
    </div>
  );
}
