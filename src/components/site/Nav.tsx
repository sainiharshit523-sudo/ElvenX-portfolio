import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "./XMark";
import { Magnetic } from "./Magnetic";

const links = [
  { to: "/", label: "Index" },
  { to: "/work", label: "Work" },
  { to: "/services", label: "Services" },
  { to: "/studio", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between px-5 py-5 md:px-10 pointer-events-auto">
          <Link to="/" aria-label="The ElvenX Studio home"><Logo /></Link>
          <span className="label hidden md:block">Digital experience studio</span>
          <Magnetic>
            <button
              onClick={() => setOpen((o) => !o)}
              data-cursor={open ? "CLOSE" : "OPEN"}
              aria-expanded={open}
              className="label flex items-center gap-3 !text-foreground"
            >
              {open ? "Close" : "Menu"}
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-foreground transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
                <span className={`absolute left-0 h-px w-5 bg-foreground transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </Magnetic>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
            className="x-grid fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto px-5 pb-8 pt-24 md:justify-end md:px-10 md:pb-10 md:pt-0 bg-card"
          >
            <ul className="my-auto md:my-0">
              {links.map((l, i) => (
                <li key={l.to} className="overflow-hidden border-b border-border">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
                    <Link to={l.to} className="group flex items-baseline justify-between py-2.5 sm:py-3">
                      <span className="display text-[10.5vw] transition-colors group-hover:text-primary sm:text-[11.5vw] md:text-[7vw]">{l.label}</span>
                      <span className="label">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between label text-xs">
              <a href="mailto:thelvenxstudio2026@gmail.com" className="break-all sm:break-normal hover:text-primary">
                thelvenxstudio2026@gmail.com
              </a>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/elvenx.agency/?__pwa=1#" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Instagram</a>
                <span>/</span>
                <a href="https://wa.me/918146587076" target="_blank" rel="noopener noreferrer" className="hover:text-primary">WhatsApp</a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
