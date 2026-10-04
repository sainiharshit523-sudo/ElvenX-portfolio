import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { whyElvenX, comparisonTable } from "@/lib/studio";
import { OWNER_WHATSAPP_NUMBER } from "@/lib/leads";
import { FadeUp, RevealLines } from "./Reveal";
import { Magnetic } from "./Magnetic";
import { XMark } from "./XMark";

export function WhyElvenX() {
  const waUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Harshit / The ElvenX Studio! I read your 'Why ElvenX' section and would love to discuss a project."
  )}`;

  return (
    <section id="why-elvenx" className="relative px-5 py-24 md:px-10 md:py-36 border-t border-border/80">
      {/* Background ambient branding grid glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="x-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      {/* Header */}
      <div className="mb-20 grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-3">
          <p className="label text-primary">(04) — Why ElvenX</p>
          <span className="mt-2 block font-mono text-xs text-muted-foreground">The Competitive Edge</span>
        </div>
        <div className="md:col-span-9">
          <h2 className="display text-4xl sm:text-5xl md:text-7xl leading-[1.05]">
            <RevealLines
              lines={[
                "Why hire ElvenX",
                "instead of another",
                <span key="highlight" className="text-primary">web developer?</span>,
              ]}
            />
          </h2>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Most developers deliver code. We build digital assets that convert attention into revenue, elevate your brand authority, and give you an unfair advantage in your market.
          </p>
        </div>
      </div>

      {/* The 5 Strategic Pillars */}
      <div className="grid gap-6 md:grid-cols-12">
        {whyElvenX.map((pillar, i) => {
          // Layout asymmetry: 1st and 2nd span 6 columns each, 3rd, 4th, 5th span 4 columns each on desktop
          const colSpan = i < 2 ? "md:col-span-6" : "md:col-span-4";

          return (
            <FadeUp
              key={pillar.n}
              delay={i * 0.08}
              className={`${colSpan} group relative flex flex-col justify-between overflow-hidden rounded-none border border-border bg-card/60 p-7 sm:p-9 backdrop-blur-sm transition-all duration-500 hover:border-primary/60 hover:bg-card hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}
            >
              {/* Corner Watermark */}
              <div className="pointer-events-none absolute right-4 top-4 text-border/30 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/20">
                <XMark className="h-16 w-16" strokeWidth={4} />
              </div>

              <div>
                {/* Top Number & Tag */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-primary">
                    {pillar.n}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground">
                    {pillar.highlight}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-8 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {pillar.title}
                </h3>

                {/* Tagline / Hook */}
                <p className="mt-2.5 font-display text-sm sm:text-base font-medium text-foreground/90 leading-snug">
                  "{pillar.tagline}"
                </p>

                {/* Deep explanation */}
                <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              {/* Actionable points */}
              <div className="mt-8 border-t border-border/70 pt-5">
                <p className="label text-[10px] text-muted-foreground/80 mb-3">Key Deliverable</p>
                <ul className="space-y-2">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs text-foreground/85">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          );
        })}
      </div>

      {/* Competitive Difference Matrix */}
      <FadeUp delay={0.2} className="mt-20 sm:mt-28">
        <div className="mb-10 text-center md:text-left">
          <p className="label text-primary">Market Comparison</p>
          <h3 className="mt-2 font-display text-2xl sm:text-4xl">The Reality of Hiring</h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            How The ElvenX Studio compares against generic options in the market.
          </p>
        </div>

        <div className="overflow-x-auto border border-border bg-card/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-card/90">
                <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                  Criterion
                </th>
                <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                  Freelance Developer
                </th>
                <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                  Traditional Agency
                </th>
                <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-primary bg-primary/10 w-1/4 border-l border-primary/30">
                  ✦ The ElvenX Studio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="py-4 px-6 font-display font-medium text-foreground">
                    {row.metric}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground text-xs sm:text-sm">
                    <span className="text-red-400 mr-2">✕</span>
                    {row.freelancer}
                  </td>
                  <td className="py-4 px-6 text-muted-foreground text-xs sm:text-sm">
                    <span className="text-amber-400 mr-2">△</span>
                    {row.agency}
                  </td>
                  <td className="py-4 px-6 text-foreground font-medium text-xs sm:text-sm bg-primary/5 border-l border-primary/30">
                    <span className="text-primary mr-2 font-bold">✓</span>
                    {row.elvenx}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeUp>

      {/* Direct Conversion Callout */}
      <FadeUp delay={0.3} className="mt-16 sm:mt-24 border border-border bg-gradient-to-b from-card to-background p-8 sm:p-14 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="label text-primary">Stop losing clients to a mediocre web presence</span>
            <h3 className="mt-3 font-display text-2xl sm:text-4xl font-bold">
              Ready to build something truly exceptional?
            </h3>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
              Work directly with our senior studio team. No junior handoffs, no generic templates, and no compromises.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Link
                to="/contact"
                data-cursor="LET'S TALK"
                className="flex items-center gap-3 bg-primary px-7 py-4 font-display text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start your project →
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="CHAT"
                className="flex items-center gap-2.5 border border-border bg-card/80 px-6 py-4 font-display text-sm font-medium text-foreground hover:border-[#25D366] hover:text-[#25D366] transition-colors"
              >
                <span>WhatsApp ↗</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
