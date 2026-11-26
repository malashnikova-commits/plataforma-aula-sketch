import fs from "node:fs";
import path from "node:path";
import {
  type Alumno,
  type Misiones,
  misionesCompletadas,
  TOTAL_MISIONES,
} from "./alumno-tipos";

export { type Alumno, type Misiones, misionesCompletadas, TOTAL_MISIONES };

const CARPETA = path.join(process.cwd(), "alumnos");

export function getAlumnos(): Alumno[] {
  if (!fs.existsSync(CARPETA)) return [];

  return fs
    .readdirSync(CARPETA)
    .filter((archivo) => archivo.endsWith(".json"))
    .map((archivo) => {
      const texto = fs.readFileSync(path.join(CARPETA, archivo), "utf8");
      return JSON.parse(texto) as Alumno;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function getAlumno(usuario: string): Alumno | undefined {
  return getAlumnos().find((a) => a.usuario === usuario);
}
