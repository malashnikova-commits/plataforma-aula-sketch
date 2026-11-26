"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  cerrarSesionUsuario,
  iniciarSesionUsuario,
  leerSesionActivaLocal,
  registrarUsuario,
  type RolPlataforma,
  type UsuarioSesion,
} from "@/lib/auth";

export type EstadoGuardado = "inactivo" | "guardando" | "guardado" | "error";

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  hidratado: boolean;
  estadoGuardado: EstadoGuardado;
  setEstadoGuardado: (estado: EstadoGuardado) => void;
  iniciarSesion: (identificador: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registrar: (params: {
    identificador: string;
    password: string;
    alias: string;
    avatar: string;
    rol: RolPlataforma;
    codigoTutor?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [hidratado, setHidratado] = useState<boolean>(false);
  const [estadoGuardado, setEstadoGuardado] = useState<EstadoGuardado>("inactivo");

  useEffect(() => {
    setUsuario(leerSesionActivaLocal());
    setHidratado(true);
  }, []);

  const iniciarSesion = useCallback(async (identificador: string, password: string) => {
    const res = await iniciarSesionUsuario({ identificador, password });
    if (res.ok) {
      setUsuario(res.usuario);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, []);

  const registrar = useCallback(
    async (params: {
      identificador: string;
      password: string;
      alias: string;
      avatar: string;
      rol: RolPlataforma;
      codigoTutor?: string;
    }) => {
      const res = await registrarUsuario(params);
      if (res.ok) {
        setUsuario(res.usuario);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    },
    []
  );

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionUsuario();
    setUsuario(null);
    setEstadoGuardado("inactivo");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        hidratado,
        estadoGuardado,
        setEstadoGuardado,
        iniciarSesion,
        registrar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
