"use client";

import { useRef, useState } from "react";
import {
  anguloDesdeCoordenadas,
  evaluarDesdeGrados,
  evaluarDesdeNota10,
  evaluarDesdePorcentaje,
  evaluarDesdeRadianes,
} from "@/lib/circuloUnitario";

interface DialCirculoUnitarioProps {
  porcentaje: number;
  onChangePorcentaje?: (nuevoPorcentaje: number) => void;
  readOnly?: boolean;
}

export function DialCirculoUnitario({
  porcentaje,
  onChangePorcentaje,
  readOnly = false,
}: DialCirculoUnitarioProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const evalActual = evaluarDesdePorcentaje(porcentaje);
  const cx = 110;
  const cy = 110;
  const r = 82;
  const rad = (evalActual.grados * Math.PI) / 180;
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);
  const largeArc = evalActual.grados > 180 ? 1 : 0;

  const actualizarDesdePointer = (clientX: number, clientY: number) => {
    if (readOnly || !onChangePorcentaje || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 220 / rect.width;
    const scaleY = 220 / rect.height;
    const dx = (clientX - rect.left) * scaleX - cx;
    const dy = (clientY - rect.top) * scaleY - cy;
    const angulo = anguloDesdeCoordenadas(dx, dy);
    onChangePorcentaje(Math.round((angulo / 360) * 100));
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
      <div className="flex justify-center sm:col-span-5">
        <svg
          ref={svgRef}
          viewBox="0 0 220 220"
          className={`h-48 w-48 select-none ${readOnly ? "" : "cursor-grab active:cursor-grabbing touch-none"}`}
          onPointerDown={(e) => {
            if (readOnly) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setArrastrando(true);
            actualizarDesdePointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!arrastrando || readOnly) return;
            actualizarDesdePointer(e.clientX, e.clientY);
          }}
          onPointerUp={() => setArrastrando(false)}
          onPointerCancel={() => setArrastrando(false)}
          aria-label={`Dial del círculo unitario en ${evalActual.grados}°`}
        >
          {/* Ejes */}
          <line x1="16" y1={cy} x2="204" y2={cy} stroke="#123850" strokeOpacity="0.25" strokeWidth="1.5" />
          <line x1={cx} y1="16" x2={cx} y2="204" stroke="#123850" strokeOpacity="0.25" strokeWidth="1.5" />

          {/* Circunferencia unitaria */}
          <circle cx={cx} cy={cy} r={r} fill="#FEFEFA" stroke="#123850" strokeWidth="3" />

          {/* Arco Gold Coast */}
          {evalActual.grados >= 359.5 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#D69A3F" strokeWidth="6" />
          ) : evalActual.grados > 0 ? (
            <path
              d={`M ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${px.toFixed(2)} ${py.toFixed(2)}`}
              fill="none"
              stroke="#D69A3F"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ) : null}

          {/* Catetos cos(θ) y sin(θ) */}
          <line
            x1={cx}
            y1={cy}
            x2={px.toFixed(2)}
            y2={cy}
            stroke="#123850"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1={px.toFixed(2)}
            y1={cy}
            x2={px.toFixed(2)}
            y2={py.toFixed(2)}
            stroke="#D69A3F"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          {/* Radio vector */}
          <line
            x1={cx}
            y1={cy}
            x2={px.toFixed(2)}
            y2={py.toFixed(2)}
            stroke="#123850"
            strokeWidth="2.5"
          />

          {/* Manija interactiva */}
          <circle
            cx={px.toFixed(2)}
            cy={py.toFixed(2)}
            r="8"
            fill="#D69A3F"
            stroke="#123850"
            strokeWidth="2.5"
          />

          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-[#123850] font-mono text-xs font-black"
          >
            {evalActual.nota10}/10
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-[#123850]/70 font-mono text-[10px] font-bold"
          >
            {evalActual.fraccionPi} rad
          </text>
        </svg>
      </div>

      <div className="space-y-3 sm:col-span-7">
        {!readOnly && onChangePorcentaje && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] font-black text-[#123850]/70">
                Nota (0–10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={evalActual.nota10}
                onChange={(e) => {
                  const res = evaluarDesdeNota10(Number(e.target.value));
                  onChangePorcentaje(res.porcentaje);
                }}
                className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-2.5 py-1 font-mono text-xs font-black text-[#123850]"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] font-black text-[#123850]/70">
                Grados (°)
              </label>
              <input
                type="number"
                min={0}
                max={360}
                step={5}
                value={Math.round(evalActual.grados)}
                onChange={(e) => {
                  const res = evaluarDesdeGrados(Number(e.target.value));
                  onChangePorcentaje(res.porcentaje);
                }}
                className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-2.5 py-1 font-mono text-xs font-black text-[#123850]"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] font-black text-[#123850]/70">
                Radianes
              </label>
              <input
                type="number"
                min={0}
                max={6.2832}
                step={0.1}
                value={evalActual.radianes}
                onChange={(e) => {
                  const res = evaluarDesdeRadianes(Number(e.target.value));
                  onChangePorcentaje(res.porcentaje);
                }}
                className="w-full rounded-xl border-2 border-[#123850] bg-[#FEFEFA] px-2.5 py-1 font-mono text-xs font-black text-[#123850]"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-dashed border-[#123850]/30 bg-[#FEFEFA] p-3 font-mono text-[11px] font-bold text-[#123850]">
          <div>
            θ = <span className="font-black">{evalActual.grados}°</span> ({evalActual.fraccionPi})
          </div>
          <div>
            τ = <span className="font-black">{evalActual.vueltas} vueltas</span>
          </div>
          <div>
            cos(θ) = <span className="font-black">{evalActual.cos}</span>
          </div>
          <div>
            sin(θ) = <span className="font-black">{evalActual.sin}</span>
          </div>
          <div>
            tan(θ) ={" "}
            <span className="font-black">
              {evalActual.esAsintota ? "Asíntota (∞)" : evalActual.tan}
            </span>
          </div>
          <div>
            <span className="rounded bg-[#D69A3F] px-1.5 py-0.5 text-[10px] font-black">
              {evalActual.cuadrante}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
