import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { OWNER_WHATSAPP_NUMBER } from "@/lib/leads";

describe("FloatingWhatsApp CTA Component", () => {
  it("renders with correct phone number and prefilled greeting", () => {
    const html = renderToString(<FloatingWhatsApp />);
    expect(html).toContain(`https://wa.me/${OWNER_WHATSAPP_NUMBER}`);
    expect(html).toContain("ElvenX");
    expect(html).toContain("Instant WhatsApp contact");
  });

  it("contains desktop text with 'Let\\'s talk' and 'WhatsApp ↗'", () => {
    const html = renderToString(<FloatingWhatsApp />);
    expect(html).toMatch(/Let(&#x27;|')s talk/);
    expect(html).toContain("WhatsApp ↗");
  });

  it("contains mobile text 'Start a conversation'", () => {
    const html = renderToString(<FloatingWhatsApp />);
    expect(html).toContain("Start a conversation");
  });
});
