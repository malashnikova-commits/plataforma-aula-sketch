import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { BarraSuperior } from "@/components/auth/BarraSuperior";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Plataforma Aula · Sketch Doodle Art";

export const metadata: Metadata = {
  title: appName,
  description: "Plataforma educativa Sketch Doodle Art + Minimalism Kidcore",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FEFEFA] font-sans text-[#123850] antialiased">
        <AuthProvider>
          <BarraSuperior />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
