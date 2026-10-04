import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function Loader() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("ex-loaded")) { setDone(true); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1600);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setDone(true); sessionStorage.setItem("ex-loaded", "1"); }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background"
          exit={{ clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" }}
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
        >
          <svg viewBox="0 0 100 100" className="h-24 w-24 text-primary">
            <motion.path d="M14 14 L86 86" stroke="currentColor" strokeWidth="6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
            <motion.path d="M86 14 L14 86" stroke="currentColor" strokeWidth="6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
          </svg>
          <span className="absolute bottom-8 right-8 display text-7xl tabular-nums">{n}</span>
          <span className="absolute bottom-10 left-8 label">ElvenX Studio — Loading experience</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
