import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { projects } from "@/lib/projects";
import { PageHeader } from "@/components/site/PageHeader";
import { ProjectCard } from "@/components/site/ProjectCard";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Work — The ElvenX Studio" },
      { name: "description", content: "Selected websites, product interfaces, brand identities and 3D launches by ElvenX Studio." },
      { property: "og:title", content: "Work — The ElvenX Studio" },
      { property: "og:description", content: "Selected projects across web, product, brand and 3D." },
    ],
  }),
  component: WorkPage,
});

const filters = ["All", "Restaurant", "Hospitality", "Web", "Product", "Brand", "3D"] as const;

function WorkPage() {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = f === "All" ? projects : projects.filter((p) => p.category === f);
  return (
    <>
      <PageHeader label="(Index) — Selected work" lines={["Work that", <span className="text-primary">moves.</span>]} />
      <div className="sticky top-16 z-30 flex flex-wrap gap-2 px-5 py-3 pb-8 md:px-10 bg-background/80 backdrop-blur-md">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`label border px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs transition-colors ${f === x ? "border-primary bg-primary !text-primary-foreground font-semibold" : "border-border bg-card/60 hover:!text-foreground"}`}>{x}</button>
        ))}
      </div>
      <section className="grid gap-x-8 gap-y-20 px-5 pb-32 md:grid-cols-2 md:px-10">
        {list.map((p, i) => <ProjectCard key={p.slug} p={p} index={i} large />)}
      </section>
    </>
  );
}
