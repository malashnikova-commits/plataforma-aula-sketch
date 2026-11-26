export function UnitCircleBadge({
  grados,
  size = 40,
  label,
}: {
  grados: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(360, grados));
  const cx = 24;
  const cy = 24;
  const r = 17;
  const rad = (clamped * Math.PI) / 180;
  // Sentido antihorario matemático (y hacia arriba en SVG)
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);
  const largeArc = clamped > 180 ? 1 : 0;

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-label={label ?? `Círculo unitario ${Math.round(clamped)}°`}
      >
        <circle cx={cx} cy={cy} r={r} fill="#FEFEFA" stroke="#123850" strokeWidth="2.5" />
        <line x1="7" y1={cy} x2="41" y2={cy} stroke="#123850" strokeOpacity="0.25" strokeWidth="1.2" />
        <line x1={cx} y1="7" x2={cx} y2="41" stroke="#123850" strokeOpacity="0.25" strokeWidth="1.2" />
        {clamped >= 359.5 ? (
          <circle cx={cx} cy={cy} r={r} stroke="#D69A3F" strokeWidth="4" />
        ) : clamped > 0 ? (
          <path
            d={`M ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${px.toFixed(2)} ${py.toFixed(2)}`}
            stroke="#D69A3F"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ) : null}
        <circle cx={px.toFixed(2)} cy={py.toFixed(2)} r="3.2" fill="#D69A3F" stroke="#123850" strokeWidth="1.5" />
      </svg>
      {label && <span className="font-mono text-xs font-black text-[#123850]">{label}</span>}
    </span>
  );
}
