"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SketchCard } from "@/components/sketch/SketchCard";
import { CODIGO_TUTOR_DEMO, type RolPlataforma } from "@/lib/auth";
import { playChime, playPop, playToggle } from "@/lib/sonidosGlobal";

const AVATARES = ["👽", "🦊", "🚀", "🎨", "🦉", "⚡"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { usuario, hidratado, iniciarSesion, registrar } = useAuth();

  const [modo, setModo] = useState<"login" | "registro">("login");
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [avatar, setAvatar] = useState("👽");
  const [rol, setRol] = useState<RolPlataforma>("alumnado");
  const [codigoTutor, setCodigoTutor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!hidratado) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center font-mono text-xs font-black text-[#123850]/70">
        Cargando sesión…
      </div>
    );
  }

  if (usuario) {
    return <>{children}</>;
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const res =
      modo === "login"
        ? await iniciarSesion(identificador, password)
        : await registrar({
            identificador,
            password,
            alias: alias || identificador,
            avatar,
            rol,
            codigoTutor,
          });

    setEnviando(false);
    if (res.ok) {
      playChime();
    } else {
      playToggle(false);
      setError(res.error ?? "No se pudo completar el acceso.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SketchCard variant="principal" className="p-6 sm:p-8">
        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              playPop();
              setModo("login");
              setError(null);
            }}
            aria-pressed={modo === "login"}
            className={`flex-1 cursor-pointer rounded-xl border-2 border-[#123850] py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              modo === "login" ? "bg-[#D69A3F] text-[#123850]" : "bg-[#FEFEFA] text-[#123850]"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => {
              playPop();
              setModo("registro");
              setError(null);
            }}
            aria-pressed={modo === "registro"}
            className={`flex-1 cursor-pointer rounded-xl border-2 border-[#123850] py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              modo === "registro" ? "bg-[#D69A3F] text-[#123850]" : "bg-[#FEFEFA] text-[#123850]"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border-2 border-[#123850] bg-[#D69A3F]/20 px-3 py-2 font-mono text-xs font-black text-[#123850]"
            >
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="auth-id"
              className="mb-1 block font-mono text-xs font-black text-[#123850]"
            >
              Usuario o correo
            </label>
            <input
              id="auth-id"
              type="text"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="ej. ana-dev"
              className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-sm font-bold text-[#123850]"
            />
          </div>

          <div>
            <label
              htmlFor="auth-pass"
              className="mb-1 block font-mono text-xs font-black text-[#123850]"
            >
              Contraseña
            </label>
            <input
              id="auth-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-sm font-bold text-[#123850]"
            />
          </div>

          {modo === "registro" && (
            <>
              <div>
                <label
                  htmlFor="auth-alias"
                  className="mb-1 block font-mono text-xs font-black text-[#123850]"
                >
                  Nombre / Alias
                </label>
                <input
                  id="auth-alias"
                  type="text"
                  required
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Tu nombre visible"
                  className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-sm font-bold text-[#123850]"
                />
              </div>

              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Avatar">
                {AVATARES.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      playPop();
                      setAvatar(em);
                    }}
                    aria-pressed={avatar === em}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-[#123850] text-lg ${
                      avatar === em ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <span className="block font-mono text-xs font-black text-[#123850]">Rol</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playToggle(true);
                      setRol("alumnado");
                    }}
                    aria-pressed={rol === "alumnado"}
                    className={`cursor-pointer rounded-xl border-2 border-[#123850] py-1.5 font-mono text-xs font-black ${
                      rol === "alumnado" ? "bg-[#D69A3F]" : "bg-[#FEFEFA]"
                    }`}
                  >
                    🎒 Alumnado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playToggle(true);
                      setRol("tutor");
                    }}
                    aria-pressed={rol === "tutor"}
                    className={`cursor-pointer rounded-xl border-2 border-[#123850] py-1.5 font-mono text-xs font-black ${
                      rol === "tutor"
                        ? "bg-[#123850] text-[#FEFEFA]"
                        : "bg-[#FEFEFA] text-[#123850]"
                    }`}
                  >
                    🔑 Tutor
                  </button>
                </div>
              </div>

              {rol === "tutor" && (
                <div>
                  <label
                    htmlFor="auth-tutor-code"
                    className="mb-1 block font-mono text-xs font-black text-[#123850]"
                  >
                    Código de invitación docente
                  </label>
                  <input
                    id="auth-tutor-code"
                    type="password"
                    required
                    value={codigoTutor}
                    onChange={(e) => setCodigoTutor(e.target.value)}
                    placeholder={`Demo local: ${CODIGO_TUTOR_DEMO}`}
                    className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 font-mono text-sm font-bold text-[#123850]"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] py-2.5 font-mono text-xs font-black uppercase text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
          >
            {enviando
              ? "Procesando…"
              : modo === "login"
                ? "Entrar al aula"
                : "Crear cuenta desde 0"}
          </button>
        </form>
      </SketchCard>
    </div>
  );
}
