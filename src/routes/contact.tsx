import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/site/PageHeader";
import { Magnetic } from "@/components/site/Magnetic";
import { saveLead, OWNER_DISPLAY_PHONE, type Lead } from "@/lib/leads";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The ElvenX Studio" },
      { name: "description", content: "Start a project with ElvenX Studio — websites, brands, 3D and motion." },
      { property: "og:title", content: "Contact — The ElvenX Studio" },
      { property: "og:description", content: "Let's make something unforgettable." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone / WhatsApp number").max(25),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "A few more words about your project, please").max(2000),
});
const interests = ["Website", "UI/UX", "Brand", "3D & Motion", "Development"];
const budgets = ["< $10k", "$10–25k", "$25–50k", "$50k+"];

function ContactPage() {
  const [picked, setPicked] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData);
    const r = schema.safeParse(raw);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }

    setErrors({});
    const leadData = {
      name: r.data.name,
      phone: r.data.phone,
      email: r.data.email,
      services: picked,
      budget: budget || "Flexible",
      message: r.data.message,
    };

    // 1. Save lead into Admin Portal storage (dispatches real-time portal notification)
    const saved = saveLead(leadData);
    setSubmittedLead(saved);
  };

  const chip = (on: boolean) =>
    `label border px-4 py-2 transition-colors ${on ? "border-primary bg-primary !text-primary-foreground" : "border-border hover:!text-foreground"}`;

  return (
    <>
      <PageHeader
        label="(Contact) — Start a project"
        lines={["Let's talk."]}
        intro="Tell us what you're building. We reply within two working days."
      />
      <section className="grid gap-16 px-5 pb-32 md:grid-cols-12 md:px-10">
        <aside className="space-y-8 md:col-span-4">
          <div>
            <p className="label">Email</p>
            <a href="mailto:thelvenxstudio2026@gmail.com" className="font-display text-2xl hover:text-primary">
              thelvenxstudio2026@gmail.com
            </a>
          </div>
          <div>
            <p className="label">WhatsApp</p>
            <a
              href="https://wa.me/918146587076"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-2xl hover:text-primary"
            >
              {OWNER_DISPLAY_PHONE}
            </a>
          </div>
          <div>
            <p className="label">Availability</p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> Booking projects for Q1 2027
            </p>
          </div>
          <div>
            <p className="label">Based</p>
            <p>Remote — working worldwide</p>
          </div>
        </aside>

        {submittedLead ? (
          <div className="space-y-8 md:col-span-8">
            <div>
              <span className="label text-primary">Inquiry Successfully Submitted</span>
              <h2 className="display mt-2 text-5xl md:text-7xl">
                Message <span className="text-primary">received.</span>
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Thank you, <strong className="text-foreground">{submittedLead.name}</strong>. Your project details have been
                recorded in our studio records. Our team will review your brief and get back to you shortly.
              </p>
            </div>

            <div className="border border-border bg-card p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="label">Project Summary</span>
                <span className="label text-primary">ID: {submittedLead.id.slice(-6)}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <p className="font-medium text-foreground">{submittedLead.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone / WhatsApp:</span>
                  <p className="font-medium text-foreground">{submittedLead.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground">{submittedLead.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p className="font-medium text-foreground">{submittedLead.budget}</p>
                </div>
              </div>
              {submittedLead.services.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-muted-foreground block mb-2">Requested Services:</span>
                  <div className="flex flex-wrap gap-2">
                    {submittedLead.services.map((s) => (
                      <span key={s} className="border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setSubmittedLead(null)}
                className="bg-primary px-8 py-4 font-display text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Submit another inquiry
              </button>
              <Link
                to="/"
                className="border border-border bg-card px-8 py-4 label hover:border-primary transition-colors text-foreground"
              >
                ← Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-10 md:col-span-8">
            <fieldset>
              <legend className="label mb-4">I'm interested in</legend>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => (
                  <button
                    type="button"
                    key={i}
                    aria-pressed={picked.includes(i)}
                    onClick={() => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}
                    className={chip(picked.includes(i))}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="label">Your Name *</span>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="mt-2 w-full border-b border-border bg-transparent py-3 font-display text-xl outline-none focus:border-primary"
                />
                {errors["name"] && <span className="mt-1 block text-sm text-destructive">{errors["name"]}</span>}
              </label>

              <label className="block">
                <span className="label">Phone / WhatsApp Number *</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  className="mt-2 w-full border-b border-border bg-transparent py-3 font-display text-xl outline-none focus:border-primary"
                />
                {errors["phone"] && <span className="mt-1 block text-sm text-destructive">{errors["phone"]}</span>}
              </label>
            </div>

            <label className="block">
              <span className="label">Your Email *</span>
              <input
                name="email"
                type="email"
                placeholder="name@company.com"
                className="mt-2 w-full border-b border-border bg-transparent py-3 font-display text-xl outline-none focus:border-primary"
              />
              {errors["email"] && <span className="mt-1 block text-sm text-destructive">{errors["email"]}</span>}
            </label>

            <label className="block">
              <span className="label">About the project *</span>
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us about the website you want to build, timelines, brand details, or reference links..."
                className="mt-2 w-full resize-none border-b border-border bg-transparent py-3 font-display text-xl outline-none focus:border-primary"
              />
              {errors["message"] && <span className="mt-1 block text-sm text-destructive">{errors["message"]}</span>}
            </label>

            <fieldset>
              <legend className="label mb-4">Budget Range</legend>
              <div className="flex flex-wrap gap-2">
                {budgets.map((b) => (
                  <button
                    type="button"
                    key={b}
                    aria-pressed={budget === b}
                    onClick={() => setBudget(b)}
                    className={chip(budget === b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="pt-4">
              <Magnetic className="w-full sm:w-auto block sm:inline-block">
                <button
                  type="submit"
                  data-cursor="START"
                  className="flex w-full sm:w-auto items-center justify-center gap-3 bg-primary px-6 sm:px-8 py-4 sm:py-5 font-display text-base sm:text-lg text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Send Inquiry &amp; Alert on WhatsApp ↗
                </button>
              </Magnetic>
              <p className="mt-4 text-xs text-muted-foreground">
                🔒 Inquiries are logged directly into our studio admin portal and instantly dispatch a WhatsApp alert with your requirements.
              </p>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
