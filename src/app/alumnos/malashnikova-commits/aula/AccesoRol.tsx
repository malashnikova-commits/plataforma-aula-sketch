"use client";

import { useState } from "react";
import { playLevelUp, playPop, playToggle } from "../sonidos";
import {
  BOTON_ACENTO,
  BOTON_CLARO,
  BOTON_OSCURO,
  FISICA_TACTIL,
  FOCO_ACCESIBLE,
  INPUT_BASE,
  SUBTARJETA,
} from "../temaSketch";
import { PIN_DOCENTE_INICIAL } from "./datosIniciales";
import type { ProgresoAlumno, RolUsuario } from "./types";

const AVATARES_SUGERIDOS = ["👽", "🦊", "🚀", "🎨", "🦉", "⚡"];

interface AccesoRolProps {
  rolActual: RolUsuario;
  docenteAutenticado: boolean;
  vistaPreviaAlumno: boolean;
  pinDocenteActual: string;
  progreso: ProgresoAlumno;
  abierto: boolean;
  onCerrar: () => void;
  onGuardarPerfilAlumno: (alias: string, avatar: string) => void;
  onAutenticarDocente: () => void;
  onCerrarSesionDocente: () => void;
  onAlternarVistaPrevia: () => void;
}

export function AccesoRol({
  rolActual,
  docenteAutenticado,
  vistaPreviaAlumno,
  pinDocenteActual,
  progreso,
  abierto,
  onCerrar,
  onGuardarPerfilAlumno,
  onAutenticarDocente,
  onCerrarSesionDocente,
  onAlternarVistaPrevia,
}: AccesoRolProps) {
  const [pestana, setPestana] = useState<RolUsuario>(rolActual);
  const [aliasInput, setAliasInput] = useState(progreso.alias);
  const [avatarInput, setAvatarInput] = useState(progreso.avatar);
  const [pinInput, setPinInput] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  if (!abierto) return null;

  const guardarAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = aliasInput.trim();
    if (limpio.length < 2) {
      setMensajeError("Mínimo 2 caracteres.");
      return;
    }
    playPop();
    onGuardarPerfilAlumno(limpio, avatarInput);
    setMensajeError(null);
    onCerrar();
  };

  const ingresarDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === pinDocenteActual) {
      playLevelUp(90);
      setPinInput("");
      setMensajeError(null);
      onAutenticarDocente();
      onCerrar();
    } else {
      playToggle(false);
      setMensajeError("PIN incorrecto.");
    }
  };

  return (
    <div
      role="region"
      aria-label="Cambiar rol"
      className={`${SUBTARJETA} mb-5 p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-[#123850]/30 pb-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rol">
          <button
            type="button"
            role="tab"
            aria-selected={pestana === "alumnado"}
            onClick={() => {
              playToggle(true);
              setPestana("alumnado");
              setMensajeError(null);
            }}
            className={`px-3 py-1 font-mono text-xs font-black ${
              pestana === "alumnado" ? BOTON_ACENTO : BOTON_CLARO
            }`}
          >
            🎒 Alumnado
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={pestana === "docente"}
            onClick={() => {
              playToggle(true);
              setPestana("docente");
              setMensajeError(null);
            }}
            className={`px-3 py-1 font-mono text-xs font-black ${
              pestana === "docente" ? BOTON_OSCURO : BOTON_CLARO
            }`}
          >
            🔑 Docente
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playToggle(false);
            onCerrar();
          }}
          aria-label="Cerrar acceso"
          className={`px-2.5 py-0.5 font-mono text-xs font-black ${BOTON_CLARO}`}
        >
          ✕
        </button>
      </div>

      {mensajeError && (
        <p
          role="alert"
          className="mb-3 rounded-xl border-2 border-[#123850] bg-[#D69A3F]/20 px-3 py-1.5 font-mono text-xs font-black text-[#123850]"
        >
          {mensajeError}
        </p>
      )}

      {pestana === "alumnado" ? (
        <form onSubmit={guardarAlumno} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="input-alias-alumno"
              className="mb-1 block font-mono text-xs font-black text-[#123850]"
            >
              Alias
            </label>
            <input
              id="input-alias-alumno"
              type="text"
              maxLength={40}
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              className={`w-full ${INPUT_BASE}`}
            />
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Avatar">
            {AVATARES_SUGERIDOS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  playPop();
                  setAvatarInput(em);
                }}
                aria-pressed={avatarInput === em}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#123850] text-lg ${FISICA_TACTIL} ${FOCO_ACCESIBLE} ${
                  avatarInput === em ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <button type="submit" className={`px-4 py-2 font-mono text-xs font-black ${BOTON_ACENTO}`}>
            Guardar
          </button>
        </form>
      ) : !docenteAutenticado ? (
        <form onSubmit={ingresarDocente} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="input-pin-docente"
              className="mb-1 block font-mono text-xs font-black text-[#123850]"
            >
              PIN Docente <span className="font-normal text-[#123850]/70">(demo: {PIN_DOCENTE_INICIAL})</span>
            </label>
            <input
              id="input-pin-docente"
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder={PIN_DOCENTE_INICIAL}
              className={`w-full font-mono ${INPUT_BASE}`}
            />
          </div>

          <button type="submit" className={`px-4 py-2 font-mono text-xs font-black ${BOTON_OSCURO}`}>
            Entrar
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-black text-[#123850]">
            Sesión docente activa
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                playToggle(!vistaPreviaAlumno);
                onAlternarVistaPrevia();
              }}
              aria-pressed={vistaPreviaAlumno}
              className={`px-3 py-1.5 font-mono text-xs font-black ${
                vistaPreviaAlumno ? BOTON_ACENTO : BOTON_CLARO
              }`}
            >
              {vistaPreviaAlumno ? "✏️ Editar" : "👁️ Vista Alumno"}
            </button>

            <button
              type="button"
              onClick={() => {
                playToggle(false);
                onCerrarSesionDocente();
              }}
              className={`px-3 py-1.5 font-mono text-xs font-black ${BOTON_OSCURO}`}
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
