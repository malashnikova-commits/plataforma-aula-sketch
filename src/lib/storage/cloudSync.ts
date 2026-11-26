"use client";

import type { ProgresoUsuario } from "@/lib/auth";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export async function sincronizarProgresoNube(
  progreso: ProgresoUsuario
): Promise<{ ok: boolean; progreso?: ProgresoUsuario; detalle: string }> {
  if (!supabaseConfigurado()) {
    return { ok: false, detalle: "Modo local (Supabase no configurado)" };
  }
  const supabase = getSupabase();
  if (!supabase) return { ok: false, detalle: "Cliente no disponible" };

  try {
    const { data: remoto } = await supabase
      .from("progreso_usuarios")
      .select("user_id, datos, updated_at")
      .eq("user_id", progreso.userId)
      .maybeSingle();

    if (
      remoto?.updated_at &&
      remoto?.datos &&
      new Date(remoto.updated_at).getTime() > new Date(progreso.updatedAt).getTime()
    ) {
      return {
        ok: true,
        progreso: remoto.datos as ProgresoUsuario,
        detalle: "Actualizado desde nube",
      };
    }

    const { error } = await supabase.from("progreso_usuarios").upsert({
      user_id: progreso.userId,
      datos: progreso,
      updated_at: progreso.updatedAt,
    });

    if (error) return { ok: false, detalle: error.message };
    return { ok: true, progreso, detalle: "Sincronizado en nube" };
  } catch {
    return { ok: false, detalle: "Sin conexión a nube" };
  }
}

export async function subirArchivoNube(
  userId: string,
  nombre: string,
  archivo: Blob
): Promise<{ ok: boolean; ruta?: string }> {
  if (!supabaseConfigurado()) return { ok: false };
  const supabase = getSupabase();
  if (!supabase) return { ok: false };

  try {
    const ruta = `${userId}/${Date.now()}-${nombre.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("entregas-aula").upload(ruta, archivo, {
      upsert: true,
    });
    if (error) return { ok: false };
    return { ok: true, ruta };
  } catch {
    return { ok: false };
  }
}
