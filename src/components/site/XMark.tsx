export function XMark({ className = "", strokeWidth = 10 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
      <path d="M14 14 L86 86" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d="M86 14 L14 86" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 sm:gap-3 font-display text-lg sm:text-xl md:text-2xl font-bold tracking-[0.14em] select-none transition-all duration-300 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)] hover:drop-shadow-[0_4px_20px_rgba(200,255,77,0.5)]">
      <img
        src="/apple-touch-icon.png"
        alt="The ElvenX Studio"
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-contain border border-white/10 shadow-md"
      />
      <span className="text-primary [text-shadow:_0_0_16px_rgba(200,255,77,0.65),_0_2px_10px_rgba(0,0,0,0.95)]">
        The
      </span>
      <span className="text-foreground [text-shadow:_0_2px_12px_rgba(0,0,0,0.95),_0_0_20px_rgba(255,255,255,0.25)]">
        ElvenX
      </span>
      <span className="text-muted-foreground/80 [text-shadow:_0_2px_10px_rgba(0,0,0,0.9)]">
        Studio
      </span>
    </span>
  );
}
