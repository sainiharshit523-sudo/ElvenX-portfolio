import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Portal Relocated — The ElvenX Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRedirectPage,
});

function AdminRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect after 1.5 seconds to the new secure link
    const timer = setTimeout(() => {
      navigate({ to: "/studio-portal-2026" });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-5 py-20">
      <div className="w-full max-w-md border border-border bg-card p-8 md:p-10 shadow-2xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <span className="text-2xl">🔒</span>
        </div>
        <span className="label text-primary font-mono">(Security Migration Notice)</span>
        <h1 className="display mt-2 text-3xl md:text-4xl text-foreground">Portal Moved</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The studio management vault has been moved from this original link to a private secure URL for confidentiality and security.
        </p>

        <div className="mt-6 border border-border bg-background/60 p-4 font-mono text-xs text-muted-foreground">
          Redirecting to: <span className="text-primary font-semibold">/studio-portal-2026</span>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/studio-portal-2026"
            className="block w-full bg-primary px-6 py-3.5 font-display text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Access Studio Portal Now →
          </Link>
          <Link
            to="/"
            className="block text-xs text-muted-foreground hover:text-foreground pt-2"
          >
            ← Return to Main Website
          </Link>
        </div>
      </div>
    </div>
  );
}
