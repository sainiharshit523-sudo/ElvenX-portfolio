import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { projects } from "@/lib/projects";
import { services, process, capabilities } from "@/lib/studio";
import { RevealLines, FadeUp, ScrollWords } from "@/components/site/Reveal";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Magnetic } from "@/components/site/Magnetic";
import { XMark } from "@/components/site/XMark";
import { WhyElvenX } from "@/components/site/WhyElvenX";

const HeroX = lazy(() => import("@/components/site/HeroX"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The ElvenX Studio — We create digital experiences that move" },
      { name: "description", content: "Premium digital studio for websites, UI/UX, brand identity, 3D and motion. A portfolio that feels like a product launch." },
      { property: "og:title", content: "The ElvenX Studio — Digital experiences that move" },
      { property: "og:description", content: "Websites, brands, 3D and motion crafted with obsessive detail." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <WhatWeCreate />
      <SelectedWork />
      <WhyElvenX />
      <Pixel />
      <Playground />
      <Services />
      <Process />
      <Studio />
      <Capabilities />
    </>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 md:px-10">
      <div className="x-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_70%_40%,black,transparent_70%)]" />
      <div className="absolute inset-0 md:left-[35%] pointer-events-none md:pointer-events-auto touch-pan-y" data-cursor="DRAG">
        <ClientOnly fallback={<StaticX />}>
          <Suspense fallback={<StaticX />}><HeroX /></Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none relative">
        <p className="label mb-6">(Studio) — Web / Brand / 3D / Motion</p>
        <h1 className="display text-[14.5vw] md:text-[9.5vw]">
          <RevealLines delay={0.3} lines={["We create", "digital experiences", <>that <MoveWord /></>]} />
        </h1>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-sm text-muted-foreground">
            ElvenX is an independent studio crafting websites, identities and interactive worlds for brands that refuse to blend in.
          </p>
          <div className="pointer-events-auto flex items-center gap-6">
            <Magnetic>
              <Link to="/work" data-cursor="EXPLORE" className="flex items-center gap-3 bg-primary px-6 py-4 font-display text-primary-foreground">
                Explore work <span aria-hidden>↘</span>
              </Link>
            </Magnetic>
            <span className="label hidden md:block">Scroll ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoveWord() {
  return (
    <span className="relative inline-flex text-primary">
      {"move.".split("").map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{ y: [0, -14, 0], skewX: [0, -8, 0] }}
          transition={{ duration: 1.4, delay: 1.6 + i * 0.07, repeat: Infinity, repeatDelay: 4, ease: [0.4, 0, 0.2, 1] }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

function StaticX() {
  return (
    <div className="flex h-full items-center justify-center">
      <XMark className="h-1/2 w-1/2 text-foreground/10" strokeWidth={8} />
    </div>
  );
}

function Intro() {
  return (
    <section className="grid gap-10 px-5 py-32 md:grid-cols-12 md:px-10 md:py-48">
      <p className="label md:col-span-3">(01) — Introduction</p>
      <ScrollWords
        className="font-display text-3xl leading-[1.1] tracking-tight md:col-span-9 md:text-6xl"
        text="We are a small studio obsessed with the space between design and engineering — where an idea becomes something you can feel, scroll, touch and remember."
      />
    </section>
  );
}

function WhatWeCreate() {
  const [active, setActive] = useState(0);
  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mb-12 flex items-baseline justify-between">
        <p className="label">(02) — What we create</p>
        <p className="label hidden md:block">Hover to explore</p>
      </div>
      <div className="grid gap-10 md:grid-cols-12">
        <ul className="md:col-span-8">
          {services.map((s, i) => (
            <li key={s.n} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} data-cursor="EXPLORE" className="border-t border-border last:border-b">
              <button className="flex w-full items-baseline gap-6 py-6 text-left" onClick={() => setActive(i)}>
                <span className="label">{s.n}</span>
                <span className={`display text-5xl transition-all duration-500 md:text-7xl ${active === i ? "translate-x-4 text-foreground" : "text-foreground/25"}`}>{s.title}</span>
              </button>
              <motion.div initial={false} animate={{ height: active === i ? "auto" : 0, opacity: active === i ? 1 : 0 }} className="overflow-hidden">
                <p className="max-w-md pb-6 pl-14 text-muted-foreground">{s.desc}</p>
              </motion.div>
            </li>
          ))}
        </ul>
        <div className="hidden md:col-span-4 md:block">
          <div className="sticky top-28 aspect-square border border-border bg-card p-6">
            <div className="flex h-full flex-col justify-between">
              <span className="label">{services[active]!.n} / 05</span>
              <motion.div key={active} initial={{ rotate: -45, scale: 0.6, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} className="flex justify-center">
                <XMark className="h-32 w-32 text-primary" strokeWidth={6} />
              </motion.div>
              <ul className="space-y-1 text-sm">
                {services[active]!.items.map((it) => <li key={it} className="flex justify-between border-b border-border py-1"><span>{it}</span><span className="text-muted-foreground">+</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mb-16 flex items-end justify-between">
        <h2 className="display text-[14vw] md:text-[8vw]"><RevealLines lines={["Conceptual", "projects"]} /></h2>
        <span className="label">(03) — 2025–26</span>
      </div>
      <div className="grid gap-x-8 gap-y-20 md:grid-cols-2">
        {projects.map((p, i) => (
          <div key={p.slug} className={i % 2 === 1 ? "md:mt-40" : ""}>
            <ProjectCard p={p} index={i} />
          </div>
        ))}
      </div>
      <div className="mt-20 flex justify-center">
        <Magnetic><Link to="/work" data-cursor="VIEW" className="label border border-border px-8 py-4 !text-foreground hover:border-primary">All projects →</Link></Magnetic>
      </div>
    </section>
  );
}

function Pixel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.4, 18]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 1, 0]);
  return (
    <section ref={ref} className="relative h-[250vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="x-grid absolute inset-0 opacity-50" />
        <motion.div style={{ scale, rotate }} className="absolute text-primary/20"><XMark className="h-40 w-40" strokeWidth={4} /></motion.div>
        <motion.div style={{ opacity: textOpacity }} className="relative px-5 text-center">
          <p className="label mb-6">(05) — Principle</p>
          <h2 className="display text-[15vw] md:text-[10vw]">Every pixel<br />has a <span className="text-primary">purpose.</span></h2>
          <p className="mx-auto mt-8 max-w-md text-muted-foreground">Nothing decorative survives our process. Every motion, colour and line earns its place.</p>
        </motion.div>
      </div>
    </section>
  );
}

function Playground() {
  const area = useRef<HTMLDivElement>(null);
  const [word, setWord] = useState("ElvenX");
  const [weight, setWeight] = useState(500);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  return (
    <section className="px-5 py-32 md:px-10">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="display text-[14vw] md:text-[8vw]"><RevealLines lines={["Digital", "playground"]} /></h2>
        <span className="label">(06) — Experiments</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div ref={area} data-cursor="DRAG" className="relative aspect-square overflow-hidden border border-border bg-card">
          <span className="label absolute left-4 top-4">Exp. 01 — Drag the X</span>
          <motion.div drag dragConstraints={area} dragElastic={0.2} whileDrag={{ scale: 1.15, rotate: 45 }} className="absolute left-1/2 top-1/2 -ml-12 -mt-12 cursor-grab text-primary active:cursor-grabbing">
            <XMark className="h-24 w-24" strokeWidth={10} />
          </motion.div>
        </div>
        <div
          data-cursor="EXPLORE"
          className="relative aspect-square overflow-hidden border border-border bg-card"
          onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        >
          <span className="label absolute left-4 top-4 z-10">Exp. 02 — X field</span>
          <div className="grid h-full grid-cols-8 grid-rows-8 p-6">
            {Array.from({ length: 64 }).map((_, i) => {
              const cx = ((i % 8) + 0.5) * 12.5, cy = (Math.floor(i / 8) + 0.5) * 12.5;
              const d = Math.hypot(cx - pos.x, cy - pos.y);
              const a = Math.atan2(pos.y - cy, pos.x - cx) * (180 / Math.PI);
              return (
                <div key={i} className="flex items-center justify-center">
                  <XMark className={`h-3 w-3 transition-colors duration-300 ${d < 20 ? "text-primary" : "text-foreground/30"}`} strokeWidth={14}
                    // rotation follows pointer
                  />
                  <span className="sr-only">{a}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative flex aspect-square flex-col justify-between overflow-hidden border border-border bg-card p-4">
          <span className="label">Exp. 03 — Type toy</span>
          <p className="display break-all text-center text-6xl transition-all" style={{ fontWeight: weight }}>{word || "X"}</p>
          <div className="space-y-3">
            <input value={word} maxLength={10} onChange={(e) => setWord(e.target.value)} aria-label="Type a word"
              className="w-full border-b border-border bg-transparent py-2 font-mono text-sm outline-none focus:border-primary" />
            <input type="range" min={300} max={700} value={weight} onChange={(e) => setWeight(+e.target.value)} aria-label="Font weight" className="w-full accent-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="px-5 py-24 md:px-10">
      <p className="label mb-12">(07) — Services</p>
      {services.map((s) => (
        <FadeUp key={s.n}>
          <Link to="/services" data-cursor="OPEN" className="group grid items-baseline gap-4 border-t border-border py-8 md:grid-cols-12">
            <span className="label md:col-span-1">{s.n}</span>
            <h3 className="display text-4xl transition-transform duration-500 group-hover:translate-x-3 group-hover:text-primary md:col-span-6 md:text-6xl">{s.title}</h3>
            <p className="text-muted-foreground md:col-span-4">{s.desc}</p>
            <span className="hidden text-right text-2xl transition-transform duration-500 group-hover:rotate-45 md:col-span-1 md:block">↗</span>
          </Link>
        </FadeUp>
      ))}
    </section>
  );
}

function Process() {
  return (
    <section className="px-5 py-24 md:px-10">
      <div className="mb-16 grid gap-6 md:grid-cols-12">
        <p className="label md:col-span-3">(08) — Process</p>
        <h2 className="display text-5xl md:col-span-9 md:text-7xl">From first idea to a launch that lands.</h2>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-5">
        {process.map((p, i) => (
          <FadeUp key={p.n} delay={i * 0.08} className="bg-background p-6">
            <span className="label text-primary">{p.n}</span>
            <h3 className="mt-16 font-display text-2xl">{p.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section className="grid gap-10 px-5 py-32 md:grid-cols-12 md:px-10">
      <p className="label md:col-span-3">(09) — Studio</p>
      <div className="md:col-span-9">
        <h2 className="display text-[13vw] md:text-[7vw]"><RevealLines lines={["Small studio.", <span className="text-muted-foreground">Big digital thinking.</span>]} /></h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[["Senior only", "You work directly with the people designing and building your project."], ["Design + code", "One team, no handoff gaps. What we design is what ships."], ["Obsessive QA", "Tested across devices, motion preferences and network conditions."]].map(([t, d]) => (
            <FadeUp key={t}><h3 className="font-display text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></FadeUp>
          ))}
        </div>
        <Link to="/studio" className="mt-12 inline-block border-b border-primary pb-1 font-display">About the studio →</Link>
      </div>
    </section>
  );
}

function Capabilities() {
  const row = [...capabilities, ...capabilities];
  return (
    <section className="overflow-hidden border-y border-border py-10">
      <div 
        className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]"
        style={{ animation: "marquee 180s linear infinite" }}
      >
        {row.map((c, i) => (
          <span key={i} className="flex items-center gap-12 display text-5xl md:text-7xl">
            {c}<XMark className="h-6 w-6 text-primary" strokeWidth={14} />
          </span>
        ))}
      </div>
    </section>
  );
}
