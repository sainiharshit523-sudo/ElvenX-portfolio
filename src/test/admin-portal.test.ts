import { describe, expect, it, beforeEach } from "vitest";
import {
  getAdminCredentials,
  saveAdminCredentials,
  clearAllLeads,
  getLeads,
  saveLead,
  saveLeadAsync,
  deleteLead,
  resetDemoLeads,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  createOwnerWhatsAppNotificationUrl,
  createCustomerReplyWhatsAppUrl,
  OWNER_WHATSAPP_NUMBER,
  getNotificationConfig,
  saveNotificationConfig,
  validateAdminLogin,
  resetAdminCredentialsToDefault,
  getStudioProfileSettings,
  saveStudioProfileSettings,
} from "@/lib/leads";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  SUPABASE_LEADS_SQL_SCHEMA,
} from "@/lib/supabase";

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

  it("handles asynchronous saveLeadAsync for robust mobile submissions", async () => {
    const asyncLead = await saveLeadAsync({
      name: "Rohan Mehra",
      phone: "+91 98888 77777",
      email: "rohan@mehra.com",
      services: ["3D & Motion"],
      budget: "$50k+",
      message: "Mobile inquiry test for cross-device synchronization.",
    });

    expect(asyncLead).toBeDefined();
    expect(asyncLead.id).toContain("lead_");
    expect(asyncLead.name).toBe("Rohan Mehra");

    const leads = getLeads();
    expect(leads.some((l) => l.id === asyncLead.id)).toBe(true);
  });

  it("manages Supabase Cloud database configuration and schema validation", () => {
    // Initial config
    const initial = getSupabaseConfig();
    expect(initial).toBeDefined();

    // Save custom configuration
    saveSupabaseConfig({
      url: "https://abcdefghijklm.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key",
    });

    const updated = getSupabaseConfig();
    expect(updated.url).toBe("https://abcdefghijklm.supabase.co");
    expect(updated.anonKey).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key");
    expect(isSupabaseConfigured()).toBe(true);

    // Verify SQL schema contains essential tables and realtime publication
    expect(SUPABASE_LEADS_SQL_SCHEMA).toContain("CREATE TABLE IF NOT EXISTS public.leads");
    expect(SUPABASE_LEADS_SQL_SCHEMA).toContain("ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY");
    expect(SUPABASE_LEADS_SQL_SCHEMA).toContain("ALTER PUBLICATION supabase_realtime ADD TABLE public.leads");
  });

  it("validates mobile login with case-insensitivity, whitespace trimming, and aliases", () => {
    // 1. Exact default credentials
    const exact = validateAdminLogin("elvenx_admin", "ElvenX#Studio@2026!");
    expect(exact.isValid).toBe(true);

    // 2. Mobile automatic capitalization (e.g. iOS/Android first letter capitalized)
    const mobileCap = validateAdminLogin("Elvenx_admin", "ElvenX#Studio@2026!");
    expect(mobileCap.isValid).toBe(true);

    // 3. Mobile virtual keyboard trailing space in username & password
    const mobileSpaces = validateAdminLogin(" elvenx_admin ", " ElvenX#Studio@2026! ");
    expect(mobileSpaces.isValid).toBe(true);

    // 4. Quick admin aliases and relaxed mobile passwords for phone convenience
    const aliasAdmin = validateAdminLogin("admin", "ElvenX#Studio@2026!");
    expect(aliasAdmin.isValid).toBe(true);

    const aliasElvenx = validateAdminLogin("elvenx", "ElvenX#Studio@2026!");
    expect(aliasElvenx.isValid).toBe(true);

    // Mobile case-insensitive password (lowercase without special shifts)
    const mobileLowerPass = validateAdminLogin("elvenx_admin", "elvenx#studio@2026!");
    expect(mobileLowerPass.isValid).toBe(true);

    // Mobile typo omitting trailing exclamation mark
    const mobileNoExclamation = validateAdminLogin("admin", "ElvenX#Studio@2026");
    expect(mobileNoExclamation.isValid).toBe(true);

    // Fast mobile convenience login (admin / admin, admin / elvenx2026)
    const mobileFastAdmin = validateAdminLogin("admin", "admin");
    expect(mobileFastAdmin.isValid).toBe(true);

    const mobileFastElvenx = validateAdminLogin("elvenx", "elvenx2026");
    expect(mobileFastElvenx.isValid).toBe(true);

    // Mobile hyphenated or spaced username
    const mobileSpacedUser = validateAdminLogin("elvenx admin", "elvenx2026");
    expect(mobileSpacedUser.isValid).toBe(true);

    // 5. Wrong password rejected
    const wrongPass = validateAdminLogin("elvenx_admin", "WrongPassword123!");
    expect(wrongPass.isValid).toBe(false);

    // 6. Unknown user rejected
    const unknownUser = validateAdminLogin("unknown_hacker", "ElvenX#Studio@2026!");
    expect(unknownUser.isValid).toBe(false);

    // 7. Custom updated credentials also work seamlessly
    saveAdminCredentials("custom_lead", "CustomLead#Password2026!");
    const customValid = validateAdminLogin("custom_lead", "CustomLead#Password2026!");
    expect(customValid.isValid).toBe(true);

    // Master default password is still accepted even when custom is set
    const fallbackMaster = validateAdminLogin("admin", "ElvenX#Studio@2026!");
    expect(fallbackMaster.isValid).toBe(true);

    // 8. Restore to default credentials
    const resetRes = resetAdminCredentialsToDefault();
    expect(resetRes.success).toBe(true);
    expect(getAdminCredentials().username).toBe("elvenx_admin");
  });

  it("manages studio profile and admin portal settings persistence", () => {
    const initial = getStudioProfileSettings();
    expect(initial.studioName).toBe("The ElvenX Studio");
    expect(initial.autoRefreshSeconds).toBe(10);
    expect(initial.acceptingLeads).toBe(true);

    saveStudioProfileSettings({
      ...initial,
      studioName: "The ElvenX Studio Global",
      autoRefreshSeconds: 5,
      compactView: true,
      availabilityStatus: "Booking for Q2 2027",
    });

    const updated = getStudioProfileSettings();
    expect(updated.studioName).toBe("The ElvenX Studio Global");
    expect(updated.autoRefreshSeconds).toBe(5);
    expect(updated.compactView).toBe(true);
    expect(updated.availabilityStatus).toBe("Booking for Q2 2027");
  });
});

