export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shadow-glow">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor">
          <path d="M6 4h2v6h8V4h2v16h-2v-6H8v6H6V4z" />
        </svg>
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-pulseGlow" />
      </div>
      <div className="leading-tight">
        <div className="font-bold tracking-tight text-ink text-[15px]">Training School</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Tienda OS · v1.0</div>
      </div>
    </div>
  );
}
