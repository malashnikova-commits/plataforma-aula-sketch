"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playLevelUp, playPop, playToggle } from "../sonidos";
import {
  BOTON_ACENTO,
  BOTON_CLARO,
  BOTON_OSCURO,
  ESTILO_LIBRETA,
  INPUT_BASE,
  PANEL_PRINCIPAL,
  SUBTARJETA,
} from "../temaSketch";
import { AccesoRol } from "./AccesoRol";
import { CalendarioTemario } from "./CalendarioTemario";
import { CarpetasProyectos } from "./CarpetasProyectos";
import {
  crearCursoInicial,
  crearProgresoInicial,
  FECHA_SEMILLA_SSR,
  formatearFechaLocalHoy,
} from "./datosIniciales";
import { MapaNodos } from "./MapaNodos";
import {
  aulaStorageLocal,
  descargarCursoComoJSON,
  validarCursoImportado,
} from "./storage";
import type {
  CarpetaFuentes,
  ConfiguracionCurso,
  NodoTemario,
  ProgresoAlumno,
  ProyectoAula,
  RecursoFuente,
  RolUsuario,
} from "./types";

type PestanaAula = "mapa" | "calendario" | "carpetas";

export function AulaInteractiva() {
  const [hoyISO, setHoyISO] = useState<string>(FECHA_SEMILLA_SSR);
  const [curso, setCurso] = useState<ConfiguracionCurso>(() =>
    crearCursoInicial(FECHA_SEMILLA_SSR)
  );
  const [progreso, setProgreso] = useState<ProgresoAlumno>(() =>
    crearProgresoInicial(FECHA_SEMILLA_SSR)
  );

  const [rolActual, setRolActual] = useState<RolUsuario>("alumnado");
  const [docenteAutenticado, setDocenteAutenticado] = useState<boolean>(false);
  const [vistaPreviaAlumno, setVistaPreviaAlumno] = useState<boolean>(false);
  const [panelAccesoAbierto, setPanelAccesoAbierto] = useState<boolean>(false);
  const [ajustesAbiertos, setAjustesAbiertos] = useState<boolean>(false);
  const [nuevoPinDocente, setNuevoPinDocente] = useState<string>("");

  const [pestanaActiva, setPestanaActiva] = useState<PestanaAula>("mapa");
  // Cerrado por defecto para mantener el mapa despejado hasta hacer clic
  const [nodoSeleccionadoId, setNodoSeleccionadoId] = useState<string | null>(null);
  const [carpetaActivaId, setCarpetaActivaId] = useState<string | null>(null);
  const [proyectoDestacadoId, setProyectoDestacadoId] = useState<string | null>(null);
  const [avisoSistema, setAvisoSistema] = useState<string | null>(null);

  const inputImportarRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const hoyReal = formatearFechaLocalHoy(new Date());
    setHoyISO(hoyReal);

    const cursoGuardado = aulaStorageLocal.cargarCurso(hoyReal);
    const progresoGuardado = aulaStorageLocal.cargarProgreso(hoyReal);

    if (progresoGuardado.ultimaFechaISO !== hoyReal) {
      const actualizado: ProgresoAlumno = {
        ...progresoGuardado,
        rachaDias: progresoGuardado.rachaDias + 1,
        ultimaFechaISO: hoyReal,
      };
      aulaStorageLocal.guardarProgreso(actualizado);
      setProgreso(actualizado);
    } else {
      setProgreso(progresoGuardado);
    }

    setCurso(cursoGuardado);
  }, []);

  const mostrarAviso = (texto: string) => {
    setAvisoSistema(texto);
    window.setTimeout(() => {
      setAvisoSistema((actual) => (actual === texto ? null : actual));
    }, 2500);
  };

  const actualizarCurso = (nuevoCurso: ConfiguracionCurso) => {
    setCurso(nuevoCurso);
    aulaStorageLocal.guardarCurso(nuevoCurso);
  };

  const actualizarProgreso = (nuevoProgreso: ProgresoAlumno) => {
    setProgreso(nuevoProgreso);
    aulaStorageLocal.guardarProgreso(nuevoProgreso);
  };

  const modoEdicionDocente =
    rolActual === "docente" && docenteAutenticado && !vistaPreviaAlumno;

  const estadisticasXP = useMemo(() => {
    const nodosVisibles = curso.nodos.filter((n) => n.visible);
    const xpTotalNodos = nodosVisibles.reduce((acc, n) => acc + n.xp, 0);
    const xpTotalProyectos = curso.proyectos.reduce((acc, p) => acc + p.xpExtra, 0);
    const xpTotalCurso = Math.max(1, xpTotalNodos + xpTotalProyectos);

    const xpGanadoNodos = nodosVisibles
      .filter((n) => progreso.nodosCompletados.includes(n.id))
      .reduce((acc, n) => acc + n.xp, 0);

    const xpGanadoProyectos = curso.proyectos
      .filter((p) => {
        const marcados = progreso.entregablesMarcados[p.id] ?? [];
        return p.entregables.length > 0 && marcados.length >= p.entregables.length;
      })
      .reduce((acc, p) => acc + p.xpExtra, 0);

    const xpGanado = xpGanadoNodos + xpGanadoProyectos;
    const porcentaje = Math.min(100, Math.round((xpGanado / xpTotalCurso) * 100));

    return { xpGanado, xpTotalCurso, porcentaje };
  }, [curso, progreso]);

  const alternarPasoChecklist = (nodoId: string, pasoId: string) => {
    const actuales = progreso.checklistMarcados[nodoId] ?? [];
    const existe = actuales.includes(pasoId);
    const siguientes = existe ? actuales.filter((id) => id !== pasoId) : [...actuales, pasoId];

    actualizarProgreso({
      ...progreso,
      checklistMarcados: { ...progreso.checklistMarcados, [nodoId]: siguientes },
    });
  };

  const registrarQuizCorrecto = (nodoId: string) => {
    if (progreso.respuestasCorrectas.includes(nodoId)) return;
    actualizarProgreso({
      ...progreso,
      respuestasCorrectas: [...progreso.respuestasCorrectas, nodoId],
    });
  };

  const alternarCompletadoNodo = (nodoId: string, completar: boolean) => {
    const yaEstaba = progreso.nodosCompletados.includes(nodoId);
    if (completar && !yaEstaba) {
      const nodo = curso.nodos.find((n) => n.id === nodoId);
      const todosPasos = nodo ? nodo.checklist.map((c) => c.id) : [];
      actualizarProgreso({
        ...progreso,
        nodosCompletados: [...progreso.nodosCompletados, nodoId],
        checklistMarcados: { ...progreso.checklistMarcados, [nodoId]: todosPasos },
      });
      if (nodo) mostrarAviso(`+${nodo.xp} XP · ${nodo.titulo}`);
    } else if (!completar && yaEstaba) {
      actualizarProgreso({
        ...progreso,
        nodosCompletados: progreso.nodosCompletados.filter((id) => id !== nodoId),
      });
    }
  };

  const alternarRecursoRevisado = (recursoId: string) => {
    const existe = progreso.recursosRevisados.includes(recursoId);
    const siguientes = existe
      ? progreso.recursosRevisados.filter((id) => id !== recursoId)
      : [...progreso.recursosRevisados, recursoId];
    actualizarProgreso({ ...progreso, recursosRevisados: siguientes });
  };

  const alternarEntregableProyecto = (
    proyectoId: string,
    entregableId: string,
    totalEntregables: number
  ) => {
    const actuales = progreso.entregablesMarcados[proyectoId] ?? [];
    const existe = actuales.includes(entregableId);
    const siguientes = existe
      ? actuales.filter((id) => id !== entregableId)
      : [...actuales, entregableId];

    actualizarProgreso({
      ...progreso,
      entregablesMarcados: { ...progreso.entregablesMarcados, [proyectoId]: siguientes },
    });

    if (!existe && siguientes.length >= totalEntregables) {
      const proy = curso.proyectos.find((p) => p.id === proyectoId);
      if (proy) mostrarAviso(`+${proy.xpExtra} XP · ${proy.titulo}`);
    }
  };

  const guardarNodoDocente = (nodoEditado: NodoTemario, esNuevo: boolean) => {
    const nuevosNodos = esNuevo
      ? [...curso.nodos, nodoEditado]
      : curso.nodos.map((n) => (n.id === nodoEditado.id ? nodoEditado : n));

    const carpetasSincronizadas = curso.carpetas.map((c) => {
      const debeEstar = nodoEditado.carpetasIds.includes(c.id);
      const yaEsta = c.nodoIds.includes(nodoEditado.id);
      if (debeEstar && !yaEsta) return { ...c, nodoIds: [...c.nodoIds, nodoEditado.id] };
      if (!debeEstar && yaEsta) {
        return { ...c, nodoIds: c.nodoIds.filter((id) => id !== nodoEditado.id) };
      }
      return c;
    });

    actualizarCurso({ ...curso, nodos: nuevosNodos, carpetas: carpetasSincronizadas });
    mostrarAviso("Nodo guardado");
  };

  const eliminarNodoDocente = (nodoId: string) => {
    const restantes = curso.nodos
      .filter((n) => n.id !== nodoId)
      .map((n, i) => ({
        ...n,
        orden: i + 1,
        prerequisitoId: n.prerequisitoId === nodoId ? null : n.prerequisitoId,
      }));
    actualizarCurso({ ...curso, nodos: restantes });
    if (nodoSeleccionadoId === nodoId) setNodoSeleccionadoId(null);
  };

  const moverNodoDocente = (nodoId: string, direccion: -1 | 1) => {
    const ordenados = [...curso.nodos].sort((a, b) => a.orden - b.orden);
    const idx = ordenados.findIndex((n) => n.id === nodoId);
    const destino = idx + direccion;
    if (idx < 0 || destino < 0 || destino >= ordenados.length) return;

    const copia = [...ordenados];
    const [extraido] = copia.splice(idx, 1);
    copia.splice(destino, 0, extraido);
    actualizarCurso({ ...curso, nodos: copia.map((n, i) => ({ ...n, orden: i + 1 })) });
  };

  const actualizarFechasNodoDocente = (
    nodoId: string,
    fechaInicio: string,
    fechaLimite: string
  ) => {
    actualizarCurso({
      ...curso,
      nodos: curso.nodos.map((n) =>
        n.id === nodoId ? { ...n, fechaInicio, fechaLimite } : n
      ),
    });
  };

  const actualizarFechasProyectoDocente = (
    proyectoId: string,
    fechaInicio: string,
    fechaLimite: string
  ) => {
    actualizarCurso({
      ...curso,
      proyectos: curso.proyectos.map((p) =>
        p.id === proyectoId ? { ...p, fechaInicio, fechaLimite } : p
      ),
    });
  };

  const crearCarpetaDocente = (nueva: CarpetaFuentes) => {
    actualizarCurso({ ...curso, carpetas: [...curso.carpetas, nueva] });
    mostrarAviso("Carpeta creada");
  };

  const eliminarCarpetaDocente = (carpetaId: string) => {
    actualizarCurso({
      ...curso,
      carpetas: curso.carpetas.filter((c) => c.id !== carpetaId),
      nodos: curso.nodos.map((n) => ({
        ...n,
        carpetasIds: n.carpetasIds.filter((id) => id !== carpetaId),
      })),
    });
    if (carpetaActivaId === carpetaId) setCarpetaActivaId(null);
  };

  const alternarVinculoCarpetaNodoDocente = (carpetaId: string, nodoId: string) => {
    const carpetasActualizadas = curso.carpetas.map((c) => {
      if (c.id !== carpetaId) return c;
      const existe = c.nodoIds.includes(nodoId);
      return {
        ...c,
        nodoIds: existe ? c.nodoIds.filter((id) => id !== nodoId) : [...c.nodoIds, nodoId],
      };
    });

    const nodosActualizados = curso.nodos.map((n) => {
      if (n.id !== nodoId) return n;
      const existe = n.carpetasIds.includes(carpetaId);
      return {
        ...n,
        carpetasIds: existe
          ? n.carpetasIds.filter((id) => id !== carpetaId)
          : [...n.carpetasIds, carpetaId],
      };
    });

    actualizarCurso({ ...curso, carpetas: carpetasActualizadas, nodos: nodosActualizados });
  };

  const agregarRecursoDocente = (carpetaId: string, recurso: RecursoFuente) => {
    actualizarCurso({
      ...curso,
      carpetas: curso.carpetas.map((c) =>
        c.id === carpetaId ? { ...c, recursos: [...c.recursos, recurso] } : c
      ),
    });
  };

  const eliminarRecursoDocente = (carpetaId: string, recursoId: string) => {
    actualizarCurso({
      ...curso,
      carpetas: curso.carpetas.map((c) =>
        c.id === carpetaId
          ? { ...c, recursos: c.recursos.filter((r) => r.id !== recursoId) }
          : c
      ),
    });
  };

  const guardarProyectoDocente = (proy: ProyectoAula, esNuevo: boolean) => {
    actualizarCurso({
      ...curso,
      proyectos: esNuevo
        ? [...curso.proyectos, proy]
        : curso.proyectos.map((p) => (p.id === proy.id ? proy : p)),
    });
    mostrarAviso("Proyecto guardado");
  };

  const eliminarProyectoDocente = (proyectoId: string) => {
    actualizarCurso({
      ...curso,
      proyectos: curso.proyectos.filter((p) => p.id !== proyectoId),
      nodos: curso.nodos.map((n) =>
        n.proyectoId === proyectoId ? { ...n, proyectoId: null } : n
      ),
    });
  };

  const manejarImportacionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      const contenido = String(lector.result ?? "");
      const validacion = validarCursoImportado(contenido, curso.pinDocente);
      if (validacion.ok) {
        playLevelUp(100);
        actualizarCurso(validacion.curso);
        mostrarAviso("Temario importado");
      } else {
        playToggle(false);
        mostrarAviso(validacion.error);
      }
      e.target.value = "";
    };
    lector.readAsText(archivo);
  };

  const guardarPinDocente = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nuevoPinDocente.trim();
    if (limpio.length < 4) return;
    playPop();
    actualizarCurso({ ...curso, pinDocente: limpio });
    setNuevoPinDocente("");
    mostrarAviso("PIN actualizado");
  };

  return (
    <section
      aria-label="Plataforma de Aula"
      className={`${PANEL_PRINCIPAL} p-6 sm:p-7`}
      style={ESTILO_LIBRETA}
    >
      {/* Barra superior única: Título, XP sincronizado, Rol y Ajustes contraíbles */}
      <header className="mb-5 space-y-4 border-b-2 border-dashed border-[#123850]/30 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight text-[#123850] sm:text-2xl">
            {curso.nombreCurso}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {docenteAutenticado && (
              <button
                type="button"
                onClick={() => {
                  playToggle(!vistaPreviaAlumno);
                  setVistaPreviaAlumno((prev) => !prev);
                }}
                aria-pressed={vistaPreviaAlumno}
                className={`px-3 py-1.5 font-mono text-xs font-black ${
                  vistaPreviaAlumno ? BOTON_ACENTO : BOTON_CLARO
                }`}
              >
                {vistaPreviaAlumno ? "✏️ Editar" : "👁️ Vista Alumno"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const sig = !panelAccesoAbierto;
                playToggle(sig);
                setPanelAccesoAbierto(sig);
              }}
              aria-expanded={panelAccesoAbierto}
              className={`px-3.5 py-1.5 font-mono text-xs font-black ${
                modoEdicionDocente ? BOTON_ACENTO : BOTON_OSCURO
              }`}
            >
              {modoEdicionDocente
                ? "🔑 Docente"
                : `${progreso.avatar} ${progreso.alias}`}
            </button>

            <button
              type="button"
              onClick={() => {
                const sig = !ajustesAbiertos;
                playToggle(sig);
                setAjustesAbiertos(sig);
              }}
              aria-expanded={ajustesAbiertos}
              aria-label="Ajustes del curso"
              className={`px-3 py-1.5 font-mono text-xs font-black ${
                ajustesAbiertos ? BOTON_OSCURO : BOTON_CLARO
              }`}
            >
              ⚙️ Ajustes
            </button>
          </div>
        </div>

        {/* Métricas consolidadas en un solo lugar limpio */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-black text-[#123850]">
            <span>
              ⚡ {estadisticasXP.xpGanado}/{estadisticasXP.xpTotalCurso} XP · 🔥 {progreso.rachaDias}d
            </span>
            <span>{estadisticasXP.porcentaje}%</span>
          </div>

          <div
            className="h-3.5 w-full overflow-hidden rounded-full border-2 border-[#123850] bg-[#123850]/10 p-0.5"
            role="progressbar"
            aria-valuenow={estadisticasXP.porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance global del curso"
          >
            <div
              className="h-full rounded-full bg-[#D69A3F] transition-all duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${estadisticasXP.porcentaje}%` }}
            />
          </div>
        </div>
      </header>

      {/* Panel contraíble de Acceso Rol (cerrado por defecto) */}
      <AccesoRol
        rolActual={rolActual}
        docenteAutenticado={docenteAutenticado}
        vistaPreviaAlumno={vistaPreviaAlumno}
        pinDocenteActual={curso.pinDocente}
        progreso={progreso}
        abierto={panelAccesoAbierto}
        onCerrar={() => setPanelAccesoAbierto(false)}
        onGuardarPerfilAlumno={(alias, avatar) => {
          setRolActual("alumnado");
          actualizarProgreso({ ...progreso, alias, avatar });
        }}
        onAutenticarDocente={() => {
          setDocenteAutenticado(true);
          setVistaPreviaAlumno(false);
          setRolActual("docente");
        }}
        onCerrarSesionDocente={() => {
          setDocenteAutenticado(false);
          setVistaPreviaAlumno(false);
          setRolActual("alumnado");
        }}
        onAlternarVistaPrevia={() => setVistaPreviaAlumno((prev) => !prev)}
      />

      {/* Panel contraíble de Ajustes secundarios (JSON, fábrica y PIN docente) */}
      {ajustesAbiertos && (
        <div
          role="region"
          aria-label="Ajustes del curso"
          className={`${SUBTARJETA} mb-5 space-y-3 p-4`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playPop();
                descargarCursoComoJSON(curso);
                mostrarAviso("JSON exportado");
              }}
              className={`px-3 py-1.5 font-mono text-xs font-black ${BOTON_CLARO}`}
            >
              ⬇ Exportar JSON
            </button>

            <button
              type="button"
              onClick={() => {
                playPop();
                inputImportarRef.current?.click();
              }}
              className={`px-3 py-1.5 font-mono text-xs font-black ${BOTON_CLARO}`}
            >
              ⬆ Importar JSON
            </button>
            <input
              ref={inputImportarRef}
              type="file"
              accept=".json,application/json"
              onChange={manejarImportacionArchivo}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                playToggle(false);
                const { curso: c, progreso: p } = aulaStorageLocal.restablecerFabrica(hoyISO);
                setCurso(c);
                setProgreso(p);
                mostrarAviso("Datos restaurados");
              }}
              className={`px-3 py-1.5 font-mono text-xs font-black ${BOTON_CLARO}`}
            >
              ↺ Restablecer
            </button>
          </div>

          {docenteAutenticado && (
            <form onSubmit={guardarPinDocente} className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                minLength={4}
                maxLength={24}
                value={nuevoPinDocente}
                onChange={(e) => setNuevoPinDocente(e.target.value)}
                placeholder="Nuevo PIN docente…"
                className={`font-mono text-xs ${INPUT_BASE}`}
              />
              <button type="submit" className={`px-3.5 py-1.5 font-mono text-xs font-black ${BOTON_ACENTO}`}>
                Cambiar PIN
              </button>
            </form>
          )}
        </div>
      )}

      {/* Notificación fugaz discreta */}
      {avisoSistema && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-3.5 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850]"
        >
          <span>{avisoSistema}</span>
        </div>
      )}

      {/* Pestañas limpias del Aula */}
      <nav aria-label="Vistas del Aula" className="mb-6 flex flex-wrap gap-2">
        {(
          [
            { id: "mapa", texto: "🗺️ Ruta" },
            { id: "calendario", texto: "📅 Calendario" },
            { id: "carpetas", texto: "📂 Fuentes y Proyectos" },
          ] as { id: PestanaAula; texto: string }[]
        ).map((tab) => {
          const activa = pestanaActiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playPop();
                setPestanaActiva(tab.id);
              }}
              aria-pressed={activa}
              className={`px-4 py-1.5 font-mono text-xs font-black ${
                activa ? BOTON_ACENTO : BOTON_CLARO
              }`}
            >
              {tab.texto}
            </button>
          );
        })}
      </nav>

      {pestanaActiva === "mapa" && (
        <MapaNodos
          nodos={curso.nodos}
          carpetas={curso.carpetas}
          proyectos={curso.proyectos}
          progreso={progreso}
          hoyISO={hoyISO}
          modoEdicionDocente={modoEdicionDocente}
          nodoSeleccionadoId={nodoSeleccionadoId}
          onSeleccionarNodo={setNodoSeleccionadoId}
          onAlternarPasoChecklist={alternarPasoChecklist}
          onResponderQuiz={registrarQuizCorrecto}
          onAlternarCompletadoNodo={alternarCompletadoNodo}
          onIrACarpeta={(cId) => {
            setCarpetaActivaId(cId);
            setProyectoDestacadoId(null);
            setPestanaActiva("carpetas");
          }}
          onIrAProyecto={(pId) => {
            setCarpetaActivaId(null);
            setProyectoDestacadoId(pId);
            setPestanaActiva("carpetas");
          }}
          onGuardarNodoDocente={guardarNodoDocente}
          onEliminarNodoDocente={eliminarNodoDocente}
          onMoverNodoDocente={moverNodoDocente}
        />
      )}

      {pestanaActiva === "calendario" && (
        <CalendarioTemario
          nodos={curso.nodos}
          proyectos={curso.proyectos}
          progreso={progreso}
          hoyISO={hoyISO}
          modoEdicionDocente={modoEdicionDocente}
          onIrANodo={(nId) => {
            setNodoSeleccionadoId(nId);
            setPestanaActiva("mapa");
          }}
          onIrAProyecto={(pId) => {
            setCarpetaActivaId(null);
            setProyectoDestacadoId(pId);
            setPestanaActiva("carpetas");
          }}
          onActualizarFechasNodoDocente={actualizarFechasNodoDocente}
          onActualizarFechasProyectoDocente={actualizarFechasProyectoDocente}
        />
      )}

      {pestanaActiva === "carpetas" && (
        <CarpetasProyectos
          carpetas={curso.carpetas}
          proyectos={curso.proyectos}
          nodos={curso.nodos}
          progreso={progreso}
          hoyISO={hoyISO}
          modoEdicionDocente={modoEdicionDocente}
          carpetaActivaId={carpetaActivaId}
          proyectoDestacadoId={proyectoDestacadoId}
          onSeleccionarCarpeta={setCarpetaActivaId}
          onAlternarRecursoRevisado={alternarRecursoRevisado}
          onAlternarEntregableProyecto={alternarEntregableProyecto}
          onIrANodo={(nId) => {
            setNodoSeleccionadoId(nId);
            setPestanaActiva("mapa");
          }}
          onCrearCarpetaDocente={crearCarpetaDocente}
          onEliminarCarpetaDocente={eliminarCarpetaDocente}
          onAlternarVinculoCarpetaNodoDocente={alternarVinculoCarpetaNodoDocente}
          onAgregarRecursoDocente={agregarRecursoDocente}
          onEliminarRecursoDocente={eliminarRecursoDocente}
          onGuardarProyectoDocente={guardarProyectoDocente}
          onEliminarProyectoDocente={eliminarProyectoDocente}
        />
      )}
    </section>
  );
}
