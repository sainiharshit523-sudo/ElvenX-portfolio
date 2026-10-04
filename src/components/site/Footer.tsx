import { Link } from "@tanstack/react-router";
import { XMark } from "./XMark";
import { Magnetic } from "./Magnetic";
import { RevealLines } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border px-5 pt-24 md:px-10">
      <p className="label mb-8">(Next) — Start a project</p>
      <Link to="/contact" data-cursor="START" className="group block">
        <h2 className="display text-[15vw] md:text-[11vw]">
          <RevealLines lines={["Let's make", "something", <span className="text-primary">unforgettable.</span>]} />
        </h2>
      </Link>
      <div className="mt-16 flex flex-wrap items-end justify-between gap-8 pb-8">
        <Magnetic>
          <a href="mailto:thelvenxstudio2026@gmail.com" className="font-display text-xl sm:text-2xl md:text-4xl break-all sm:break-normal underline decoration-primary underline-offset-8">
            thelvenxstudio2026@gmail.com
          </a>
        </Magnetic>
        <div className="flex gap-8 label">
          <a
            href="https://www.instagram.com/elvenx.agency/?__pwa=1#"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/918146587076"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between border-t border-border py-6 label text-xs">
        <span>© 2026 The ElvenX Studio · <Link to="/studio-portal-2026" className="text-muted-foreground/60 hover:text-primary transition-colors">Studio Portal</Link></span>
        <span className="text-muted-foreground">We create digital experiences that move.</span>
      </div>
      <XMark className="pointer-events-none absolute -bottom-[18vw] -right-[8vw] h-[45vw] w-[45vw] text-foreground/[0.03]" strokeWidth={6} />
    </footer>
  );
}
