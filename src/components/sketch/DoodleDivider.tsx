export function DoodleDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`my-5 flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-[2px] flex-1 border-t-2 border-dashed border-[#123850]/30" />
      <svg className="h-3 w-16 text-[#D69A3F]" viewBox="0 0 64 12" fill="none">
        <path
          d="M2 8 C 14 2, 24 10, 32 6 C 40 2, 50 10, 62 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="h-[2px] flex-1 border-t-2 border-dashed border-[#123850]/30" />
    </div>
  );
}
