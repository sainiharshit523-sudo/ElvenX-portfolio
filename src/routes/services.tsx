import { createFileRoute } from "@tanstack/react-router";
import { services, process } from "@/lib/studio";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeUp } from "@/components/site/Reveal";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — The ElvenX Studio" },
      { name: "description", content: "Web experiences, UI/UX systems, brand identity, 3D & motion and frontend development." },
      { property: "og:title", content: "Services — The ElvenX Studio" },
      { property: "og:description", content: "Five disciplines, one studio: web, UI/UX, brand, 3D & motion, development." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHeader label="(Services) — What we do" lines={["Five", "disciplines.", <span className="text-muted-foreground">One studio.</span>]} />
      <section className="px-5 md:px-10">
        {services.map((s) => (
          <FadeUp key={s.n} className="grid gap-6 border-t border-border py-14 md:grid-cols-12">
            <span className="label md:col-span-1">{s.n}</span>
            <h2 className="display text-5xl md:col-span-5 md:text-7xl">{s.title}</h2>
            <p className="text-lg text-muted-foreground md:col-span-3">{s.desc}</p>
            <ul className="md:col-span-3">
              {s.items.map((i) => <li key={i} className="border-b border-border py-2 text-sm">{i}</li>)}
            </ul>
          </FadeUp>
        ))}
      </section>
      <section className="px-5 py-32 md:px-10">
        <p className="label mb-10">How we work</p>
        <ol className="grid gap-px bg-border md:grid-cols-5">
          {process.map((p) => (
            <li key={p.n} className="bg-background p-6">
              <span className="label text-primary">{p.n}</span>
              <h3 className="mt-12 font-display text-2xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
