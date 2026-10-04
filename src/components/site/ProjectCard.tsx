import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Project } from "@/lib/projects";

export function ProjectCard({ p, index, large = false }: { p: Project; index: number; large?: boolean }) {
  return (
    <Link to="/work/$slug" params={{ slug: p.slug }} data-cursor="VIEW" className="group block">
      <motion.div
        initial={{ clipPath: "inset(12% 12% 12% 12%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        className={`overflow-hidden bg-card ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}
      >
        <img src={p.image} alt={`${p.name} — ${p.tagline}`} loading="lazy" width={1600} height={1008}
          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105" />
      </motion.div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-baseline gap-4">
          <span className="label">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="font-display text-2xl tracking-tight md:text-4xl">{p.name}</h3>
          <span className="hidden text-muted-foreground md:inline">{p.tagline}</span>
        </div>
        <span className="label">{p.services.slice(0, 2).join(" / ")} — {p.year}</span>
      </div>
    </Link>
  );
}
