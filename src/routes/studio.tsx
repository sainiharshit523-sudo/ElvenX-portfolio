import { createFileRoute } from "@tanstack/react-router";
import { capabilities } from "@/lib/studio";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeUp, ScrollWords } from "@/components/site/Reveal";
import { XMark } from "@/components/site/XMark";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — The ElvenX Studio" },
      { name: "description", content: "A small, senior studio where design and engineering live in the same room." },
      { property: "og:title", content: "Studio — The ElvenX Studio" },
      { property: "og:description", content: "Small studio. Big digital thinking." },
    ],
  }),
  component: StudioPage,
});

const values = [
  ["Idea first", "Every project starts with one sharp idea. Everything else serves it."],
  ["Motion with meaning", "We animate to explain, guide and delight — never to decorate."],
  ["Built, not mocked", "Our designers think in code and our engineers think in pixels."],
  ["Performance is design", "Fast, accessible experiences are part of the craft, not an afterthought."],
];

function StudioPage() {
  return (
    <>
      <PageHeader label="(Studio) — About" lines={["Small studio.", <span className="text-primary">Big digital</span>, "thinking."]} />
      <section className="grid gap-10 px-5 py-24 md:grid-cols-12 md:px-10">
        <p className="label md:col-span-3">Manifesto</p>
        <ScrollWords className="font-display text-3xl leading-[1.1] tracking-tight md:col-span-9 md:text-5xl"
          text="The X is where two lines meet. It's our mark because it's how we work — design and technology crossing at a single, precise point, creating something neither could alone." />
      </section>
      <section className="grid gap-px bg-border px-0 md:grid-cols-2">
        {values.map(([t, d], i) => (
          <FadeUp key={t} className="bg-background p-10 md:p-16">
            <span className="label">0{i + 1}</span>
            <h2 className="mt-10 display text-5xl">{t}</h2>
            <p className="mt-4 max-w-sm text-muted-foreground">{d}</p>
          </FadeUp>
        ))}
      </section>
      <section className="px-5 py-32 md:px-10">
        <p className="label mb-10">Capabilities</p>
        <div className="flex flex-wrap gap-3">
          {capabilities.map((c) => (
            <span key={c} className="flex items-center gap-2 border border-border px-5 py-3 font-display text-lg">
              <XMark className="h-3 w-3 text-primary" strokeWidth={14} />{c}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
