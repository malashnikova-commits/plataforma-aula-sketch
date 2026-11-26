import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSupabase, supabaseConfigurado } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Mensaje = { id: number; usuario: string; mensaje: string; creado_en: string };

async function enviarMensaje(formData: FormData) {
  "use server";
  const supabase = getSupabase();
  if (!supabase) return;

  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const mensaje = String(formData.get("mensaje") ?? "").trim();
  if (!usuario || !mensaje) return;

  await supabase.from("mensajes").insert({ usuario, mensaje });
  revalidatePath("/supabase");
}

export default async function PaginaSupabase() {
  if (!supabaseConfigurado()) {
    return (
      <Contenedor>
        <div className="mt-6 rounded-2xl border-[2.5px] border-dashed border-[#123850] bg-[#D69A3F]/20 p-5 text-sm font-bold text-[#123850]">
          <p className="font-black">Modo local activo</p>
          <p className="mt-1 text-[#123850]/70">
            Configura <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> en <code>.env.local</code> para
            sincronizar mensajes con Postgres.
          </p>
        </div>
      </Contenedor>
    );
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("mensajes")
    .select("id, usuario, mensaje, creado_en")
    .order("creado_en", { ascending: false })
    .limit(20);

  return (
    <Contenedor>
      {error ? (
        <div className="mt-6 rounded-2xl border-[2.5px] border-[#123850] bg-[#D69A3F]/20 p-5 text-sm font-bold text-[#123850]">
          <p className="font-black">Conectado con detalle pendiente</p>
          <p className="mt-1 text-[#123850]/70">
            Supabase respondió: <code>{error.message}</code>
          </p>
        </div>
      ) : (
        <>
          <form action={enviarMensaje} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              name="usuario"
              placeholder="tu-usuario"
              required
              className="rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 font-mono text-sm font-bold text-[#123850] sm:w-44"
            />
            <input
              name="mensaje"
              placeholder="Escribe un mensaje…"
              required
              maxLength={200}
              className="flex-1 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3 py-2 text-sm font-bold text-[#123850]"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-xl border-2 border-[#123850] bg-[#D69A3F] px-5 py-2 font-mono text-xs font-black uppercase text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Enviar
            </button>
          </form>

          <ul className="mt-6 space-y-3">
            {(data as Mensaje[]).length === 0 && (
              <li className="font-mono text-xs font-bold text-[#123850]/70">
                Sin mensajes todavía.
              </li>
            )}
            {(data as Mensaje[]).map((m) => (
              <li
                key={m.id}
                className="rounded-2xl border-[2.5px] border-[#123850] bg-[#FEFEFA] p-4 shadow-[4px_4px_0px_#123850]"
              >
                <p className="font-bold text-[#123850]">{m.mensaje}</p>
                <p className="mt-1 font-mono text-xs font-bold text-[#123850]/70">
                  @{m.usuario} · {new Date(m.creado_en).toLocaleString("es-MX")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Contenedor>
  );
}

function Contenedor({ children }: { children: React.ReactNode }) {
  return (
    <main className="fondo-cuadricula min-h-[calc(100vh-56px)] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-3.5 py-1.5 font-mono text-xs font-black text-[#123850] shadow-[3px_3px_0px_#123850] transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          ← Volver
        </Link>

        <section className="mt-6 rounded-3xl border-[3px] border-[#123850] bg-[#FEFEFA] p-6 shadow-[6px_6px_0px_#123850] sm:p-8">
          <h1 className="text-2xl font-black text-[#123850] sm:text-3xl">
            Mensajes desde Supabase
          </h1>
          {children}
        </section>
      </div>
    </main>
  );
}
