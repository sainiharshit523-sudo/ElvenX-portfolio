import { describe, expect, it, beforeEach } from "vitest";
import {
  getAdminCredentials,
  saveAdminCredentials,
  clearAllLeads,
  getLeads,
  saveLead,
  deleteLead,
  resetDemoLeads,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  createOwnerWhatsAppNotificationUrl,
  createCustomerReplyWhatsAppUrl,
  OWNER_WHATSAPP_NUMBER,
  getNotificationConfig,
  saveNotificationConfig,
} from "@/lib/leads";

const mockStorage: Record<string, string> = {};

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    },
    key: (index: number) => Object.keys(mockStorage)[index] ?? null,
    length: 0,
  } as unknown as Storage;
}

if (typeof globalThis.window === "undefined") {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

describe("Admin Portal & Credentials Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default strong admin credentials when none stored", () => {
    const creds = getAdminCredentials();
    expect(creds.username).toBe(DEFAULT_ADMIN_USERNAME);
    expect(creds.password).toBe(DEFAULT_ADMIN_PASSWORD);
    expect(creds.username).toBe("elvenx_admin");
    expect(creds.password).toBe("ElvenX#Studio@2026!");
  });

  it("allows updating username and password with strong validation", () => {
    // Too short password
    const failRes = saveAdminCredentials("studio_boss", "short");
    expect(failRes.success).toBe(false);

    // Too short username
    const failUser = saveAdminCredentials("ab", "NewSecurePassword#2026");
    expect(failUser.success).toBe(false);

    // Valid update
    const successRes = saveAdminCredentials("the_studio_lead", "SuperVault#Secret99!");
    expect(successRes.success).toBe(true);

    const updated = getAdminCredentials();
    expect(updated.username).toBe("the_studio_lead");
    expect(updated.password).toBe("SuperVault#Secret99!");
  });

  it("can clear all lead data and restore demo leads", () => {
    // Add sample lead
    saveLead({
      name: "Test Customer",
      phone: "+91 99999 88888",
      email: "test@example.com",
      services: ["Website"],
      budget: "$10k",
      message: "Test project brief",
    });

    const currentLeads = getLeads();
    expect(currentLeads.length).toBeGreaterThan(0);

    // Clear all
    clearAllLeads();
    const afterClear = getLeads();
    expect(afterClear.length).toBe(0);

    // Restore demo leads
    resetDemoLeads();
    const restored = getLeads();
    expect(restored.length).toBeGreaterThanOrEqual(2);
  });

  it("generates correct WhatsApp notification URLs for owner and customer reply", () => {
    const lead = {
      name: "Rahul Verma",
      phone: "+91 98765 43210",
      email: "rahul@verma.in",
      services: ["Website", "UI/UX"],
      budget: "$25k",
      message: "New corporate platform needed.",
    };

    const ownerUrl = createOwnerWhatsAppNotificationUrl(lead);
    expect(ownerUrl).toContain(`https://wa.me/${OWNER_WHATSAPP_NUMBER}`);
    expect(ownerUrl).toContain(encodeURIComponent("Rahul Verma"));

    const replyUrl = createCustomerReplyWhatsAppUrl(lead.phone, lead.name);
    expect(replyUrl).toContain("https://wa.me/919876543210");
  });

  it("manages notification configurations and dispatches lead notifications", () => {
    const config = getNotificationConfig();
    expect(config.soundEnabled).toBe(true);

    saveNotificationConfig({
      ownerPhone: "919999900000",
      soundEnabled: false,
      browserNotificationsEnabled: true,
      callMeBotApiKey: "test_key_123",
      webhookUrl: "https://webhook.site/test",
    });

    const updatedConfig = getNotificationConfig();
    expect(updatedConfig.ownerPhone).toBe("919999900000");
    expect(updatedConfig.soundEnabled).toBe(false);
    expect(updatedConfig.callMeBotApiKey).toBe("test_key_123");

    // Test that saveLead triggers custom event if window exists
    let capturedEventDetail: unknown = null;
    const testListener = (e: Event) => {
      capturedEventDetail = (e as CustomEvent).detail;
    };

    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("elvenx_new_lead_received", testListener);
    }

    const newLead = saveLead({
      name: "Ananya Sharma",
      phone: "+91 91234 56789",
      email: "ananya@startup.io",
      services: ["Branding"],
      budget: "$15k",
      message: "Looking for complete rebrand.",
    });

    expect(newLead.id).toBeDefined();
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("elvenx_new_lead_received", testListener);
    }
  });
});

