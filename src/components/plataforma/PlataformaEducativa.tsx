"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DialCirculoUnitario } from "@/components/evaluacion/DialCirculoUnitario";
import { DoodleDivider } from "@/components/sketch/DoodleDivider";
import { SketchCard } from "@/components/sketch/SketchCard";
import { UnitCircleBadge } from "@/components/sketch/UnitCircleBadge";
import { TarjetaAlumno } from "@/components/TarjetaAlumno";
import type { Alumno } from "@/lib/alumno-tipos";
import { crearProgresoDesdeCero, type EntregaAlumno, type ProgresoUsuario } from "@/lib/auth";
import { playChime, playPop, playToggle } from "@/lib/sonidosGlobal";
import {
  cargarProgresoLocal,
  exportarRespaldoJSON,
  guardarAdjuntoIDB,
  guardarEntregaLocal,
  guardarRespaldoEnCarpetaDispositivo,
  guardarTrabajoLocal,
  importarRespaldoJSON,
  listarEntregasLocales,
  listarTrabajosLocales,
  type TrabajoPublicado,
} from "@/lib/storage/localDB";
import {
  esEntornoLocalNavegador,
  probarEstadoBanco,
  subirArchivoBanco,
} from "@/lib/storage/powershellBridge";
import { useAutoSave } from "@/lib/storage/useAutoSave";

type TabPlataforma = "aula" | "ruta" | "muro";

const NODOS_RUTA = [
  { id: "n1", titulo: "Entorno y Fork", xp: 50 },
  { id: "n2", titulo: "Node.js fuera del navegador", xp: 70 },
  { id: "n3", titulo: "Next.js + Tailwind Sketch", xp: 90 },
  { id: "n4", titulo: "Diseño asistido con v0", xp: 100 },
  { id: "n5", titulo: "OpenCode + Supabase MCP", xp: 130 },
];

export function PlataformaEducativa({ alumnos }: { alumnos: Alumno[] }) {
  const { usuario, setEstadoGuardado } = useAuth();

  const [tab, setTab] = useState<TabPlataforma>("aula");
  const [progreso, setProgreso] = useState<ProgresoUsuario | null>(null);
  const [trabajos, setTrabajos] = useState<TrabajoPublicado[]>([]);
  const [entregasGlobales, setEntregasGlobales] = useState<EntregaAlumno[]>([]);

  // Ajustes híbridos / PowerShell (contraídos por defecto)
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);
  const [esEntornoLocal, setEsEntornoLocal] = useState(false);
  const [usarBancoPS, setUsarBancoPS] = useState(false);
  const [tokenPS, setTokenPS] = useState("");
  const [estadoPS, setEstadoPS] = useState<string | null>(null);

  // Formularios Tutor contraíbles
  const [mostrarFormTrabajo, setMostrarFormTrabajo] = useState(false);
  const [tituloTrabajo, setTituloTrabajo] = useState("");
  const [descTrabajo, setDescTrabajo] = useState("");
  const [fechaTrabajo, setFechaTrabajo] = useState("");
  const [pondTrabajo, setPondTrabajo] = useState(25);
  const [carpetaTrabajo, setCarpetaTrabajo] = useState("Lecturas Base");
  const [archivoApoyo, setArchivoApoyo] = useState<File | null>(null);

  // Entrega de alumno por trabajo
  const [comentariosEntrega, setComentariosEntrega] = useState<Record<string, string>>({});
  const [archivosEntrega, setArchivosEntrega] = useState<Record<string, File | null>>({});

  // Calificación de Tutor en el Dial
  const [entregaEnRevision, setEntregaEnRevision] = useState<string | null>(null);
  const [notaDial, setNotaDial] = useState<number>(80);
  const [retroInput, setRetroInput] = useState<string>("");

  // Buscador del Muro
  const [busquedaMuro, setBusquedaMuro] = useState("");

  // Detalle contraíble de nodo
  const [nodoAbiertoId, setNodoAbiertoId] = useState<string | null>(null);

  const importRef = useRef<HTMLInputElement | null>(null);

  // Detección automática de entorno local vs enlace público
  useEffect(() => {
    const local = esEntornoLocalNavegador();
    setEsEntornoLocal(local);
    if (!local) setUsarBancoPS(false);
  }, []);

  // Hidratación desde IndexedDB / localStorage aislada por userId
  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;

    const cargar = async () => {
      const [prog, trabs, ents] = await Promise.all([
        cargarProgresoLocal(usuario.userId),
        listarTrabajosLocales(),
        listarEntregasLocales(),
      ]);
      if (cancelado) return;

      setProgreso(prog ?? crearProgresoDesdeCero(usuario.userId));
      setTrabajos(trabs);
      setEntregasGlobales(ents);
      setFechaTrabajo(new Date().toISOString().slice(0, 10));
    };

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  useAutoSave({
    progreso,
    habilitado: Boolean(usuario && progreso),
    usarBancoPowerShell: usarBancoPS,
    tokenPowerShell: tokenPS,
    onEstadoCambio: setEstadoGuardado,
  });

  const alumnosFiltrados = useMemo(() => {
    const q = busquedaMuro.trim().toLowerCase();
    if (!q) return alumnos;
    return alumnos.filter(
      (a) => a.nombre.toLowerCase().includes(q) || a.usuario.toLowerCase().includes(q)
    );
  }, [alumnos, busquedaMuro]);

  if (!usuario || !progreso) {
    return null;
  }

  const esTutor = usuario.rol === "tutor";

  const publicarTrabajo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloTrabajo.trim()) return;

    let adjuntoId: string | undefined;
    let nombreAdjunto: string | undefined;
    if (archivoApoyo) {
      adjuntoId = `apoyo-${Date.now()}`;
      nombreAdjunto = archivoApoyo.name;
      await guardarAdjuntoIDB({
        id: adjuntoId,
        userId: usuario.userId,
        nombre: archivoApoyo.name,
        mimeType: archivoApoyo.type || "application/octet-stream",
        size: archivoApoyo.size,
        blob: archivoApoyo,
        createdAt: new Date().toISOString(),
      });
    }

    const nuevo: TrabajoPublicado = {
      id: `trab-${Date.now()}`,
      titulo: tituloTrabajo.trim(),
      descripcion: descTrabajo.trim(),
      fechaLimite: fechaTrabajo || new Date().toISOString().slice(0, 10),
      ponderacion: pondTrabajo,
      carpetaFuentes: carpetaTrabajo.trim() || "General",
      adjuntoId,
      nombreAdjunto,
      createdAt: new Date().toISOString(),
    };

    await guardarTrabajoLocal(nuevo);
    setTrabajos((prev) => [nuevo, ...prev]);
    setTituloTrabajo("");
    setDescTrabajo("");
    setArchivoApoyo(null);
    setMostrarFormTrabajo(false);
    playChime();
  };

  const enviarEntregaAlumno = async (trabajoId: string) => {
    const comentario = (comentariosEntrega[trabajoId] ?? "").trim();
    const archivo = archivosEntrega[trabajoId] ?? null;
    if (!comentario && !archivo) return;

    let adjuntoId: string | undefined;
    let nombreAdjunto: string | undefined;

    if (archivo) {
      adjuntoId = `ent-adj-${Date.now()}`;
      nombreAdjunto = archivo.name;
      await guardarAdjuntoIDB({
        id: adjuntoId,
        userId: usuario.userId,
        nombre: archivo.name,
        mimeType: archivo.type || "application/octet-stream",
        size: archivo.size,
        blob: archivo,
        createdAt: new Date().toISOString(),
      });

      if (usarBancoPS && tokenPS.trim() && esEntornoLocal) {
        const buf = await archivo.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        await subirArchivoBanco(
          tokenPS.trim(),
          { userId: usuario.userId, nombre: archivo.name },
          b64
        );
      }
    }

    const nuevaEntrega: EntregaAlumno = {
      id: `ent-${usuario.userId}-${trabajoId}`,
      trabajoId,
      userId: usuario.userId,
      aliasAlumno: usuario.alias,
      comentario,
      adjuntoId,
      nombreAdjunto,
      calificacionPorcentaje: null,
      updatedAt: new Date().toISOString(),
    };

    await guardarEntregaLocal(nuevaEntrega);
    setEntregasGlobales((prev) => {
      const sinPrevia = prev.filter((e) => e.id !== nuevaEntrega.id);
      return [nuevaEntrega, ...sinPrevia];
    });

    setProgreso((prev) => {
      if (!prev) return prev;
      const sinPrevia = prev.entregas.filter((e) => e.id !== nuevaEntrega.id);
      return {
        ...prev,
        entregas: [nuevaEntrega, ...sinPrevia],
        updatedAt: new Date().toISOString(),
      };
    });

    playChime();
  };

  const guardarCalificacionTutor = async (entrega: EntregaAlumno) => {
    const actualizada: EntregaAlumno = {
      ...entrega,
      calificacionPorcentaje: notaDial,
      retroalimentacion: retroInput.trim(),
      updatedAt: new Date().toISOString(),
    };

    await guardarEntregaLocal(actualizada);
    setEntregasGlobales((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));

    // Sincronizar también en el progreso del alumno evaluado
    const progAlumno = await cargarProgresoLocal(entrega.userId);
    if (progAlumno) {
      const entregasAct = progAlumno.entregas.map((e) =>
        e.id === actualizada.id ? actualizada : e
      );
      const evaluadas = entregasAct.filter((e) => e.calificacionPorcentaje !== null);
      const promedioPct =
        evaluadas.length > 0
          ? evaluadas.reduce((acc, e) => acc + (e.calificacionPorcentaje ?? 0), 0) /
            evaluadas.length
          : 0;

      const nuevoProg: ProgresoUsuario = {
        ...progAlumno,
        entregas: entregasAct,
        anguloGrados: Math.round((promedioPct / 100) * 360),
        xp: Math.max(progAlumno.xp, Math.round(promedioPct * 3)),
        updatedAt: new Date().toISOString(),
      };
      if (entrega.userId === usuario.userId) {
        setProgreso(nuevoProg);
      } else {
        const { guardarProgresoLocal } = await import("@/lib/storage/localDB");
        await guardarProgresoLocal(nuevoProg);
      }
    }

    setEntregaEnRevision(null);
    playChime();
  };

  const alternarNodo = (nodoId: string, xpNodo: number) => {
    const ya = progreso.nodosCompletados.includes(nodoId);
    const siguientes = ya
      ? progreso.nodosCompletados.filter((id) => id !== nodoId)
      : [...progreso.nodosCompletados, nodoId];
    const nuevoXp = Math.max(0, progreso.xp + (ya ? -xpNodo : xpNodo));
    const nuevoAngulo = Math.min(
      360,
      Math.round((siguientes.length / NODOS_RUTA.length) * 360)
    );

    if (ya) playToggle(false);
    else playChime();

    setProgreso({
      ...progreso,
      nodosCompletados: siguientes,
      xp: nuevoXp,
      anguloGrados: nuevoAngulo,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-10">
      {/* Cabecera única limpia con métricas del usuario desde 0 */}
      <SketchCard variant="principal" className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UnitCircleBadge
              grados={progreso.anguloGrados}
              size={54}
              label={`${Math.round((progreso.anguloGrados / 360) * 100)}%`}
            />
            <div>
              <h1 className="text-xl font-black text-[#123850] sm:text-2xl">
                {usuario.avatar} {usuario.alias}
              </h1>
              <p className="font-mono text-xs font-bold text-[#123850]/70">
                {progreso.xp} XP · {progreso.nodosCompletados.length}/{NODOS_RUTA.length} nodos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const sig = !ajustesAbiertos;
              playToggle(sig);
              setAjustesAbiertos(sig);
            }}
            aria-expanded={ajustesAbiertos}
            className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3.5 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            ⚙️ Ajustes
          </button>
        </div>

        {/* Panel contraíble de Ajustes (Híbrido: JSON, Carpeta Dispositivo, Banco PowerShell) */}
        {ajustesAbiertos && (
          <div className="mt-5 space-y-4 border-t-2 border-dashed border-[#123850]/30 pt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  exportarRespaldoJSON({ progreso, trabajos, entregasGlobales });
                }}
                className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
              >
                ⬇ Exportar .json
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  importRef.current?.click();
                }}
                className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
              >
                ⬆ Importar .json
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const data = await importarRespaldoJSON<{ progreso?: ProgresoUsuario }>(file);
                  if (data?.progreso) {
                    setProgreso({ ...data.progreso, userId: usuario.userId });
                    playChime();
                  }
                  e.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={async () => {
                  const res = await guardarRespaldoEnCarpetaDispositivo({
                    progreso,
                    trabajos,
                  });
                  setEstadoPS(res.mensaje);
                  playToggle(res.ok);
                }}
                className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
              >
                📁 Guardar en carpeta
              </button>
            </div>

            {/* Puente PowerShell 127.0.0.1:4780 (solo en localhost) */}
            {esEntornoLocal ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-[#123850]/30 p-3">
                <button
                  type="button"
                  onClick={() => {
                    const sig = !usarBancoPS;
                    playToggle(sig);
                    setUsarBancoPS(sig);
                  }}
                  aria-pressed={usarBancoPS}
                  className={`cursor-pointer rounded-xl border-2 border-[#123850] px-3 py-1 font-mono text-xs font-black ${
                    usarBancoPS ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
                  }`}
                >
                  {usarBancoPS ? "🟢 Banco Local PowerShell ON" : "⚪ Banco Local PowerShell OFF"}
                </button>

                <input
                  type="password"
                  value={tokenPS}
                  onChange={(e) => setTokenPS(e.target.value)}
                  placeholder="X-Local-Token…"
                  className="flex-1 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1 font-mono text-xs font-bold"
                />

                <button
                  type="button"
                  onClick={async () => {
                    const r = await probarEstadoBanco(tokenPS.trim());
                    setEstadoPS(
                      r.disponible && !r.error
                        ? "✓ Conectado a 127.0.0.1:4780"
                        : `Sin conexión (${r.error ?? "usa IndexedDB"})`
                    );
                  }}
                  className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#123850] px-3 py-1 font-mono text-xs font-black text-[#FEFEFA]"
                >
                  Probar
                </button>

                {estadoPS && (
                  <span className="font-mono text-xs font-bold text-[#123850]/70">{estadoPS}</span>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#123850]/30 bg-[#D69A3F]/20 px-3 py-2 font-mono text-xs font-bold text-[#123850]">
                🔒 Banco PowerShell solo activo en localhost · Operando con nube / navegador
              </div>
            )}
          </div>
        )}
      </SketchCard>

      {/* Navegación de foco único */}
      <nav aria-label="Secciones de la plataforma" className="flex flex-wrap gap-2.5">
        {(
          [
            { id: "aula", label: "📚 Aula y Trabajos" },
            { id: "ruta", label: "🗺️ Ruta de Nodos" },
            { id: "muro", label: "🧱 Muro del Taller" },
          ] as { id: TabPlataforma; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              playPop();
              setTab(item.id);
            }}
            aria-pressed={tab === item.id}
            className={`cursor-pointer rounded-xl border-2 border-[#123850] px-4 py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              tab === item.id ? "bg-[#D69A3F] text-[#123850]" : "bg-[#FEFEFA] text-[#123850]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* FOCO 1: AULA Y TRABAJOS */}
      {tab === "aula" && (
        <div className="space-y-5">
          {esTutor && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sig = !mostrarFormTrabajo;
                    playToggle(sig);
                    setMostrarFormTrabajo(sig);
                  }}
                  aria-expanded={mostrarFormTrabajo}
                  className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-4 py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
                >
                  {mostrarFormTrabajo ? "Cerrar ✕" : "+ Publicar trabajo"}
                </button>
              </div>

              {mostrarFormTrabajo && (
                <SketchCard className="p-5">
                  <form onSubmit={publicarTrabajo} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <input
                        type="text"
                        required
                        placeholder="Título del trabajo…"
                        value={tituloTrabajo}
                        onChange={(e) => setTituloTrabajo(e.target.value)}
                        className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 text-sm font-bold sm:col-span-2"
                      />
                      <input
                        type="date"
                        value={fechaTrabajo}
                        onChange={(e) => setFechaTrabajo(e.target.value)}
                        className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 font-mono text-xs font-bold"
                      />
                      <input
                        type="number"
                        min={5}
                        max={100}
                        value={pondTrabajo}
                        onChange={(e) => setPondTrabajo(Number(e.target.value) || 25)}
                        className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 font-mono text-xs font-bold"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Descripción e instrucciones…"
                      value={descTrabajo}
                      onChange={(e) => setDescTrabajo(e.target.value)}
                      className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-sm font-bold"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="text"
                        value={carpetaTrabajo}
                        onChange={(e) => setCarpetaTrabajo(e.target.value)}
                        placeholder="Carpeta de fuentes"
                        className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="file"
                        onChange={(e) => setArchivoApoyo(e.target.files?.[0] ?? null)}
                        className="font-mono text-xs font-bold"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-5 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </SketchCard>
              )}

              {/* Acordeón de entregas para calificar con DialCirculoUnitario */}
              <SketchCard
                collapsible
                title={`📥 Entregas recibidas (${entregasGlobales.length})`}
              >
                {entregasGlobales.length === 0 ? (
                  <p className="font-mono text-xs font-bold text-[#123850]/70">
                    Sin entregas enviadas todavía.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {entregasGlobales.map((ent) => {
                      const enEdicion = entregaEnRevision === ent.id;
                      return (
                        <div
                          key={ent.id}
                          className="rounded-2xl border-2 border-[#123850] bg-[#FEFEFA] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-black">{ent.aliasAlumno}</p>
                              <p className="text-xs font-medium text-[#123850]/70">
                                {ent.comentario} {ent.nombreAdjunto ? `· 📎 ${ent.nombreAdjunto}` : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {ent.calificacionPorcentaje !== null && (
                                <UnitCircleBadge
                                  grados={(ent.calificacionPorcentaje / 100) * 360}
                                  size={34}
                                  label={`${(ent.calificacionPorcentaje / 10).toFixed(1)}/10`}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  playToggle(!enEdicion);
                                  setEntregaEnRevision(enEdicion ? null : ent.id);
                                  setNotaDial(ent.calificacionPorcentaje ?? 80);
                                  setRetroInput(ent.retroalimentacion ?? "");
                                }}
                                className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3 py-1 font-mono text-xs font-black"
                              >
                                {enEdicion ? "Cerrar" : "Calificar"}
                              </button>
                            </div>
                          </div>

                          {enEdicion && (
                            <div className="mt-4 space-y-3 border-t-2 border-dashed border-[#123850]/30 pt-4">
                              <DialCirculoUnitario
                                porcentaje={notaDial}
                                onChangePorcentaje={setNotaDial}
                              />
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                  type="text"
                                  value={retroInput}
                                  onChange={(e) => setRetroInput(e.target.value)}
                                  placeholder="Retroalimentación breve…"
                                  className="flex-1 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-1.5 text-xs font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => void guardarCalificacionTutor(ent)}
                                  className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-4 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
                                >
                                  Guardar calificación
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SketchCard>
            </div>
          )}

          {/* Lista de trabajos publicados en tarjetas contraíbles */}
          {trabajos.length === 0 ? (
            <SketchCard className="p-6 text-center font-mono text-xs font-bold text-[#123850]/70">
              {esTutor
                ? "Usa '+ Publicar trabajo' para asignar el primer reto del grupo."
                : "Aún no hay trabajos publicados. Explora la Ruta de Nodos o el Muro."}
            </SketchCard>
          ) : (
            <div className="space-y-3">
              {trabajos.map((trab) => {
                const miEntrega = progreso.entregas.find((e) => e.trabajoId === trab.id);
                return (
                  <SketchCard
                    key={trab.id}
                    collapsible
                    title={trab.titulo}
                    summaryRight={
                      <span>
                        {trab.fechaLimite} · {trab.ponderacion}%
                      </span>
                    }
                  >
                    <div className="space-y-4">
                      {trab.descripcion && (
                        <p className="text-sm font-medium text-[#123850]/70">{trab.descripcion}</p>
                      )}

                      <p className="font-mono text-xs font-bold text-[#123850]/70">
                        📂 {trab.carpetaFuentes}{" "}
                        {trab.nombreAdjunto ? `· 📎 ${trab.nombreAdjunto}` : ""}
                      </p>

                      {miEntrega?.calificacionPorcentaje !== null &&
                      miEntrega?.calificacionPorcentaje !== undefined ? (
                        <div className="rounded-2xl border-2 border-[#123850] bg-[#D69A3F]/20 p-4">
                          <DialCirculoUnitario
                            porcentaje={miEntrega.calificacionPorcentaje}
                            readOnly
                          />
                          {miEntrega.retroalimentacion && (
                            <p className="mt-2 font-mono text-xs font-bold text-[#123850]">
                              Tutor: {miEntrega.retroalimentacion}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <textarea
                            rows={2}
                            value={comentariosEntrega[trab.id] ?? miEntrega?.comentario ?? ""}
                            onChange={(e) =>
                              setComentariosEntrega((prev) => ({
                                ...prev,
                                [trab.id]: e.target.value,
                              }))
                            }
                            placeholder="Notas de tu entrega…"
                            className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-xs font-bold"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <input
                              type="file"
                              onChange={(e) =>
                                setArchivosEntrega((prev) => ({
                                  ...prev,
                                  [trab.id]: e.target.files?.[0] ?? null,
                                }))
                              }
                              className="font-mono text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => void enviarEntregaAlumno(trab.id)}
                              className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-4 py-1.5 font-mono text-xs font-black shadow-[3px_3px_0px_#123850]"
                            >
                              {miEntrega ? "Actualizar entrega" : "Enviar entrega"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </SketchCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FOCO 2: RUTA DE NODOS (arranca en 0 para cada cuenta nueva) */}
      {tab === "ruta" && (
        <SketchCard variant="principal" className="p-6">
          <div className="flex flex-col items-center gap-3">
            {NODOS_RUTA.map((nodo, idx) => {
              const hecho = progreso.nodosCompletados.includes(nodo.id);
              const previoHecho =
                idx === 0 || progreso.nodosCompletados.includes(NODOS_RUTA[idx - 1].id);
              const abierto = nodoAbiertoId === nodo.id;

              return (
                <div key={nodo.id} className="flex w-full max-w-md flex-col items-center">
                  <button
                    type="button"
                    disabled={!previoHecho}
                    onClick={() => {
                      const sig = abierto ? null : nodo.id;
                      playToggle(Boolean(sig));
                      setNodoAbiertoId(sig);
                    }}
                    aria-expanded={abierto}
                    className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-[3px] border-[#123850] font-mono text-lg font-black shadow-[0_4px_0_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      hecho
                        ? "bg-[#D69A3F] text-[#123850]"
                        : previoHecho
                          ? "bg-[#FEFEFA] text-[#123850] ring-4 ring-[#D69A3F]"
                          : "border-dashed bg-[#FEFEFA] text-[#123850]/70"
                    }`}
                  >
                    {hecho ? "✅" : previoHecho ? "⭐" : "🔒"}
                  </button>

                  <p className="mt-1.5 text-center text-xs font-black text-[#123850]">
                    {nodo.titulo}
                  </p>

                  {abierto && (
                    <div className="mt-2 flex w-full items-center justify-between rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-4 py-2.5">
                      <span className="font-mono text-xs font-black">+{nodo.xp} XP</span>
                      <button
                        type="button"
                        onClick={() => alternarNodo(nodo.id, nodo.xp)}
                        className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3 py-1 font-mono text-xs font-black"
                      >
                        {hecho ? "Desmarcar" : "Completar"}
                      </button>
                    </div>
                  )}

                  {idx < NODOS_RUTA.length - 1 && (
                    <svg className="my-1 h-6 w-8" viewBox="0 0 32 24" fill="none" aria-hidden="true">
                      <line
                        x1="16"
                        y1="0"
                        x2="16"
                        y2="24"
                        stroke={hecho ? "#D69A3F" : "#123850"}
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </SketchCard>
      )}

      {/* FOCO 3: MURO DEL TALLER */}
      {tab === "muro" && (
        <div className="space-y-4">
          <input
            type="search"
            value={busquedaMuro}
            onChange={(e) => setBusquedaMuro(e.target.value)}
            placeholder="Buscar integrante…"
            className="w-full max-w-sm rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3.5 py-2 text-sm font-bold text-[#123850]"
          />

          <DoodleDivider />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {alumnosFiltrados.map((alumno) => (
              <TarjetaAlumno key={alumno.usuario} alumno={alumno} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
