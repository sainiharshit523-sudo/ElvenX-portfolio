import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProject, projects } from "@/lib/projects";
import { RevealLines, FadeUp } from "@/components/site/Reveal";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Project not found — ElvenX" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.project;
    return {
      meta: [
        { title: `${p.name} — Case study — The ElvenX Studio` },
        { name: "description", content: p.overview },
        { property: "og:title", content: `${p.name} — ${p.tagline}` },
        { property: "og:description", content: p.overview },
      ],
    };
  },
  notFoundComponent: ProjectMissing,
  component: CaseStudy,
});

function ProjectMissing() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-5 md:px-10">
      <h1 className="display text-7xl">Project not found.</h1>
      <Link to="/work" className="mt-8 font-display underline">All work</Link>
    </div>
  );
}

function CaseStudy() {
  const { project: p } = Route.useLoaderData();
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length]!;
  const blocks: [string, string][] = [
    ["Objective", p.objective],
    ["Design direction", p.direction],
    ["UX", p.ux],
    ["Motion", p.motion],
    ["Result", p.result],
  ];
  return (
    <article>
      <section className="px-5 pb-12 pt-40 md:px-10 md:pt-48">
        <p className="label mb-6">Case study — {p.client}</p>
        <h1 className="display text-[16vw] sm:text-[19vw] md:text-[15vw] break-words"><RevealLines lines={[p.name]} /></h1>
        <div className="mt-10 grid gap-6 border-t border-border pt-6 md:grid-cols-4">
          {[["Client", p.client], ["Year", p.year], ["Category", p.category], ["Services", p.services.join(", ")]].map(([k, v]) => (
            <div key={k}><p className="label">{k}</p><p className="mt-1">{v}</p></div>
          ))}
        </div>
        {p.url && (
          <div className="mt-8">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex items-center gap-2 border border-border px-5 py-3 !text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Visit live site ↗
            </a>
          </div>
        )}
      </section>
      <div className="px-5 md:px-10">
        <img src={p.image} alt={`${p.name} hero visual`} width={1600} height={1008} className="aspect-[16/9] w-full object-cover" />
      </div>
      <section className="grid gap-10 px-5 py-32 md:grid-cols-12 md:px-10">
        <p className="label md:col-span-3">Overview</p>
        <p className="font-display text-3xl leading-tight tracking-tight md:col-span-9 md:text-5xl">{p.overview}</p>
      </section>
      <section className="px-5 md:px-10">
        {blocks.map(([k, v], i) => (
          <FadeUp key={k} className="grid gap-4 border-t border-border py-10 md:grid-cols-12">
            <span className="label md:col-span-1">0{i + 1}</span>
            <h2 className="font-display text-2xl md:col-span-4">{k}</h2>
            <p className="text-lg text-muted-foreground md:col-span-7">{v}</p>
          </FadeUp>
        ))}
      </section>
      {p.detailImage1 && p.detailImage2 ? (
        <section className="grid gap-6 px-5 py-24 md:grid-cols-2 md:px-10">
          <div className={`flex items-center justify-center overflow-hidden rounded-sm border border-border ${p.slug === "laung-laachi" ? "bg-[#FDF7EB]" : "bg-card p-2 md:p-4"}`}>
            <img
              src={p.detailImage1}
              alt={`${p.name} showcase 1`}
              loading="lazy"
              width={1600}
              height={1008}
              className={`w-full ${p.slug === "laung-laachi" ? "h-full object-cover" : "h-auto object-contain"}`}
            />
          </div>
          <div className={`flex items-center justify-center overflow-hidden rounded-sm border border-border ${p.slug === "laung-laachi" ? "bg-[#FFFDF7] p-3 md:p-6" : "bg-card p-2 md:p-4"}`}>
            <img
              src={p.detailImage2}
              alt={`${p.name} showcase 2`}
              loading="lazy"
              width={1600}
              height={1008}
              className="w-full h-auto object-contain"
            />
          </div>
        </section>
      ) : (
        <section className="grid gap-4 px-5 py-24 md:grid-cols-3 md:px-10">
          <div className="overflow-hidden md:col-span-2">
            <img
              src={p.image}
              alt={`${p.name} desktop detail`}
              loading="lazy"
              width={1600}
              height={1008}
              className="aspect-[4/3] h-full w-full scale-125 object-cover object-left"
            />
          </div>
          <div className="overflow-hidden">
            <img
              src={p.image}
              alt={`${p.name} mobile detail`}
              loading="lazy"
              width={1600}
              height={1008}
              className="aspect-[9/16] h-full w-full object-cover object-right"
            />
          </div>
        </section>
      )}
      <Link to="/work/$slug" params={{ slug: next.slug }} data-cursor="OPEN" className="group block border-t border-border px-5 py-24 md:px-10">
        <p className="label">Next project</p>
        <p className="display mt-4 text-[15vw] sm:text-[17vw] transition-colors group-hover:text-primary md:text-[12vw] break-words">{next.name} →</p>
      </Link>
    </article>
  );
}
