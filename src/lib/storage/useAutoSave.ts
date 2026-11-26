"use client";

import { useEffect, useRef } from "react";
import type { ProgresoUsuario } from "@/lib/auth";
import type { EstadoGuardado } from "@/components/auth/AuthProvider";
import { sincronizarProgresoNube } from "./cloudSync";
import { guardarProgresoLocal } from "./localDB";
import { enviarProgresoBanco, esEntornoLocalNavegador } from "./powershellBridge";

interface UseAutoSaveOpciones {
  progreso: ProgresoUsuario | null;
  habilitado: boolean;
  usarBancoPowerShell: boolean;
  tokenPowerShell: string;
  onEstadoCambio: (estado: EstadoGuardado) => void;
}

export function useAutoSave({
  progreso,
  habilitado,
  usarBancoPowerShell,
  tokenPowerShell,
  onEstadoCambio,
}: UseAutoSaveOpciones): void {
  const primerRenderRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!habilitado || !progreso) return;

    if (primerRenderRef.current) {
      primerRenderRef.current = false;
      return;
    }

    onEstadoCambio("guardando");
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(async () => {
      try {
        await guardarProgresoLocal(progreso);

        if (usarBancoPowerShell && tokenPowerShell.trim() && esEntornoLocalNavegador()) {
          await enviarProgresoBanco(tokenPowerShell.trim(), progreso);
        }

        await sincronizarProgresoNube(progreso);
        onEstadoCambio("guardado");
      } catch {
        onEstadoCambio("error");
      }
    }, 600);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [progreso, habilitado, usarBancoPowerShell, tokenPowerShell, onEstadoCambio]);
}
