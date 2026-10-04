import type { ReactNode } from "react";
import { RevealLines } from "./Reveal";

export function PageHeader({ label, lines, intro }: { label: string; lines: ReactNode[]; intro?: string }) {
  return (
    <section className="px-5 pb-16 pt-40 md:px-10 md:pt-48">
      <p className="label mb-6">{label}</p>
      <h1 className="display text-[16vw] md:text-[10vw]"><RevealLines lines={lines} /></h1>
      {intro && <p className="mt-10 max-w-xl text-lg text-muted-foreground">{intro}</p>}
    </section>
  );
}
