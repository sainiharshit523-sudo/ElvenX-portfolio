import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { whyElvenX, comparisonTable } from "@/lib/studio";
import { OWNER_WHATSAPP_NUMBER } from "@/lib/leads";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Import after mock
import { WhyElvenX } from "@/components/site/WhyElvenX";

describe("WhyElvenX Component", () => {
  it("renders all 5 strategic positioning pillars", () => {
    const html = renderToString(<WhyElvenX />);

    // Assert section heading and numbering
    expect(html).toContain("Why hire ElvenX");
    expect(html).toContain("web developer?");
    expect(html).toContain("(04) — Why ElvenX");

    // Assert each pillar title and tagline
    for (const pillar of whyElvenX) {
      expect(html).toContain(pillar.title);
      expect(html).toContain(pillar.tagline.replace(/'/g, "&#x27;"));
      expect(html).toContain(pillar.highlight);
    }
  });

  it("renders the 5 requested specific taglines", () => {
    const html = renderToString(<WhyElvenX />);
    expect(html).toContain("We don&#x27;t start with templates. We start with the business.");
    expect(html).toContain("No disconnect between what is designed and what gets built.");
    expect(html).toContain("Every page has a purpose: trust, enquiry, booking or sale.");
    expect(html).toContain("Modern interaction, typography, motion and visual systems.");
    expect(html).toContain("Fast, responsive, SEO-ready and optimized for mobile.");
  });

  it("renders the competitive comparison table", () => {
    const html = renderToString(<WhyElvenX />);
    expect(html).toContain("The Reality of Hiring");
    expect(html).toContain("Freelance Developer");
    expect(html).toContain("Traditional Agency");
    expect(html).toContain("✦ The ElvenX Studio");

    for (const row of comparisonTable) {
      expect(html).toContain(row.metric.replace(/&/g, "&amp;"));
    }
  });

  it("includes direct CTAs for project contact and WhatsApp", () => {
    const html = renderToString(<WhyElvenX />);
    expect(html).toContain("Start your project →");
    expect(html).toContain(`https://wa.me/${OWNER_WHATSAPP_NUMBER}`);
    expect(html).toContain("WhatsApp ↗");
  });
});
