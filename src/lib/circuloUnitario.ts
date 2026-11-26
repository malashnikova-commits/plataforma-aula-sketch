export type CuadranteCalificacion =
  | "Q1: Inicial"
  | "Q2: En desarrollo"
  | "Q3: Competente"
  | "Q4: Sobresaliente";

export interface EvaluacionTrigonometrica {
  porcentaje: number;
  nota10: number;
  grados: number;
  radianes: number;
  fraccionPi: string;
  vueltas: number;
  cos: number;
  sin: number;
  tan: number | null;
  esAsintota: boolean;
  cuadrante: CuadranteCalificacion;
}

function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplificarFraccionPi(grados: number): string {
  const g = Math.max(0, Math.min(360, grados));
  const num = Math.round(g * 2);
  const den = 360;
  if (num === 0) return "0";
  const d = mcd(num, den);
  const sNum = num / d;
  const sDen = den / d;
  if (sDen === 1) return sNum === 1 ? "π" : `${sNum}π`;
  return sNum === 1 ? `π/${sDen}` : `${sNum}π/${sDen}`;
}

function obtenerCuadrante(grados: number): CuadranteCalificacion {
  if (grados < 90) return "Q1: Inicial";
  if (grados < 180) return "Q2: En desarrollo";
  if (grados < 270) return "Q3: Competente";
  return "Q4: Sobresaliente";
}

function redondear(valor: number, decimales = 4): number {
  const factor = 10 ** decimales;
  const res = Math.round(valor * factor) / factor;
  return Object.is(res, -0) ? 0 : res;
}

export function evaluarDesdePorcentaje(porcentajeEntrada: number): EvaluacionTrigonometrica {
  const porcentaje = Math.max(0, Math.min(100, Number.isFinite(porcentajeEntrada) ? porcentajeEntrada : 0));
  const nota10 = redondear(porcentaje / 10, 2);
  const grados = redondear((porcentaje / 100) * 360, 2);
  const radianes = redondear((porcentaje / 100) * 2 * Math.PI, 4);
  const radExacto = (grados * Math.PI) / 180;
  const cos = redondear(Math.cos(radExacto), 4);
  const sin = redondear(Math.sin(radExacto), 4);
  const esAsintota = Math.abs(Math.cos(radExacto)) < 1e-6;
  const tan = esAsintota ? null : redondear(Math.tan(radExacto), 4);

  return {
    porcentaje: redondear(porcentaje, 2),
    nota10,
    grados,
    radianes,
    fraccionPi: simplificarFraccionPi(grados),
    vueltas: redondear(porcentaje / 100, 3),
    cos,
    sin,
    tan,
    esAsintota,
    cuadrante: obtenerCuadrante(grados),
  };
}

export function evaluarDesdeNota10(nota: number): EvaluacionTrigonometrica {
  const clamped = Math.max(0, Math.min(10, Number.isFinite(nota) ? nota : 0));
  return evaluarDesdePorcentaje(clamped * 10);
}

export function evaluarDesdeGrados(grados: number): EvaluacionTrigonometrica {
  const clamped = Math.max(0, Math.min(360, Number.isFinite(grados) ? grados : 0));
  return evaluarDesdePorcentaje((clamped / 360) * 100);
}

export function evaluarDesdeRadianes(radianes: number): EvaluacionTrigonometrica {
  const clamped = Math.max(0, Math.min(2 * Math.PI, Number.isFinite(radianes) ? radianes : 0));
  return evaluarDesdePorcentaje((clamped / (2 * Math.PI)) * 100);
}

export function anguloDesdeCoordenadas(dx: number, dy: number): number {
  // En pantalla Y crece hacia abajo; invertimos dy para ángulo matemático antihorario
  const rad = Math.atan2(-dy, dx);
  const deg = (rad * 180) / Math.PI;
  return deg >= 0 ? deg : 360 + deg;
}
