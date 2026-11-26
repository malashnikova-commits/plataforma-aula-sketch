import { getAlumnos } from "@/lib/alumnos";
import { AuthGate } from "@/components/auth/AuthGate";
import { PlataformaEducativa } from "@/components/plataforma/PlataformaEducativa";

export default function Home() {
  const alumnos = getAlumnos();

  return (
    <main className="fondo-cuadricula min-h-[calc(100vh-56px)]">
      <AuthGate>
        <PlataformaEducativa alumnos={alumnos} />
      </AuthGate>
    </main>
  );
}
