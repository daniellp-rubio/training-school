import Image from "next/image";

export default function Logo({
  className = "",
  showText = true,
  size = 36,
}: {
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-border-strong shadow-chrome flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src="/training_school.png"
          alt="Training School"
          width={size}
          height={size}
          priority
          className="object-contain"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-bright animate-pulseGlow" />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-ink text-[15px]">
            Training School
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
            Tienda OS · v1.0
          </div>
        </div>
      )}
    </div>
  );
}
