import { useEffect, useRef, useState } from "react";

/** Custom cursor: elements opt in with data-cursor="VIEW" etc. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor],a,button,input,textarea") as HTMLElement | null;
      setLabel(t?.dataset["cursor"] ?? null);
      setHover(!!t);
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);

  if (!enabled) return null;
  const size = label ? 84 : hover ? 44 : 28;
  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100]">
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-primary" />
      </div>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[99]">
        <div
          className={`flex items-center justify-center rounded-full border transition-all duration-300 ease-out ${label ? "border-primary bg-primary text-primary-foreground" : "border-foreground/40"}`}
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
        >
          {label && <span className="font-mono text-[10px] tracking-[0.2em]">{label}</span>}
        </div>
      </div>
    </>
  );
}
