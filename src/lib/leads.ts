export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  services: string[];
  budget: string;
  message: string;
  createdAt: string;
  status: "new" | "contacted" | "in-discussion" | "converted" | "archived";
  notes?: string;
};

export const OWNER_WHATSAPP_NUMBER = "918146587076";
export const OWNER_DISPLAY_PHONE = "+91 81465 87076";
export const OWNER_EMAIL = "thelvenxstudio2026@gmail.com";

export const DEFAULT_ADMIN_USERNAME = "elvenx_admin";
export const DEFAULT_ADMIN_PASSWORD = "ElvenX#Studio@2026!";

const STORAGE_KEY = "elvenx_studio_leads_v1";
const CREDENTIALS_STORAGE_KEY = "elvenx_admin_credentials_v2";

export type AdminCredentials = {
  username: string;
  password: string;
  updatedAt: string;
};

export function getAdminCredentials(): AdminCredentials {
  if (typeof window === "undefined") {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) {
      const initial: AdminCredentials = {
        username: DEFAULT_ADMIN_USERNAME,
        password: DEFAULT_ADMIN_PASSWORD,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.username === "string" && typeof parsed.password === "string") {
      return parsed;
    }
    return {
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to load admin credentials:", err);
    return {
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveAdminCredentials(username: string, password: string): { success: boolean; message: string } {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: "Username must be at least 3 characters long." };
  }
  if (!cleanPassword || cleanPassword.length < 8) {
    return { success: false, message: "Password must be at least 8 characters long." };
  }

  const credentials: AdminCredentials = {
    username: cleanUsername,
    password: cleanPassword,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
      window.dispatchEvent(new CustomEvent("elvenx_credentials_updated", { detail: credentials }));
      return { success: true, message: "Credentials successfully updated!" };
    } catch (err) {
      console.error("Failed to save admin credentials:", err);
      return { success: false, message: "Storage error occurred while saving." };
    }
  }

  return { success: true, message: "Credentials updated." };
}

export function clearAllLeads(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: [] }));
  } catch (err) {
    console.error("Failed to clear all leads:", err);
  }
}

export function exportLeadsToJSON(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `elvenx_leads_backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: "lead_demo_1",
    name: "Arjun Sharma",
    phone: "+91 98765 43210",
    email: "arjun.sharma@nexusventures.in",
    services: ["Website", "UI/UX", "3D & Motion"],
    budget: "$25–50k",
    message: "We need an immersive flagship website and interactive 3D product showcase for our upcoming fintech platform launch.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "new",
    notes: "High-priority inquiry. Interested in WebGL and dark aesthetic.",
  },
  {
    id: "lead_demo_2",
    name: "Simran Kaur",
    phone: "+91 88721 99012",
    email: "simran@boutiqueescapes.com",
    services: ["Website", "Brand"],
    budget: "$10–25k",
    message: "Looking for a luxury hospitality website with room booking tours and mobile-friendly restaurant menu reservation system.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: "in-discussion",
    notes: "Shared Dayal Hotel case study with client as reference.",
  },
];

export function getLeads(): Lead[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load leads from storage:", err);
    return [];
  }
}

export type NotificationConfig = {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  callMeBotApiKey?: string;
  ownerPhone?: string;
  webhookUrl?: string;
};

const NOTIFICATION_CONFIG_KEY = "elvenx_notification_config_v1";

export function getNotificationConfig(): NotificationConfig {
  if (typeof window === "undefined") {
    return { soundEnabled: true, browserNotificationsEnabled: true };
  }
  try {
    const raw = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    if (!raw) return { soundEnabled: true, browserNotificationsEnabled: true };
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      browserNotificationsEnabled: parsed.browserNotificationsEnabled ?? true,
      callMeBotApiKey: parsed.callMeBotApiKey || parsed.callmebotApiKey || "",
      ownerPhone: parsed.ownerPhone || OWNER_WHATSAPP_NUMBER,
      webhookUrl: parsed.webhookUrl || parsed.customWebhookUrl || "",
    };
  } catch {
    return { soundEnabled: true, browserNotificationsEnabled: true };
  }
}

export function saveNotificationConfig(cfg: NotificationConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error("Failed to save notification config:", err);
  }
}

export function saveLead(input: Omit<Lead, "id" | "createdAt" | "status">): Lead {
  const newLead: Lead = {
    ...input,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  if (typeof window !== "undefined") {
    try {
      const current = getLeads();
      const updated = [newLead, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: updated }));
      window.dispatchEvent(new CustomEvent("elvenx_new_lead_received", { detail: newLead }));

      // Automated WhatsApp notification via CallMeBot if API key is configured
      const cfg = getNotificationConfig();
      if (cfg.callMeBotApiKey && cfg.callMeBotApiKey.trim()) {
        const phone = (cfg.ownerPhone || OWNER_WHATSAPP_NUMBER).replace(/[^0-9]/g, "");
        const alertMsg = `⚡ *NEW INQUIRY — THE ELVENX STUDIO*\n\n` +
          `👤 *Client:* ${newLead.name}\n` +
          `📱 *Phone:* ${newLead.phone}\n` +
          `✉️ *Email:* ${newLead.email}\n` +
          `💰 *Budget:* ${newLead.budget}\n` +
          `💼 *Services:* ${newLead.services.join(", ") || "General"}\n\n` +
          `📝 *Message:*\n"${newLead.message}"`;

        const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(alertMsg)}&apikey=${cfg.callMeBotApiKey.trim()}`;
        fetch(callMeBotUrl, { mode: "no-cors" }).catch((e) => console.debug("CallMeBot dispatch error:", e));
      }

      // Automated Webhook dispatch if configured
      if (cfg.webhookUrl && cfg.webhookUrl.trim()) {
        fetch(cfg.webhookUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "new_lead", lead: newLead, timestamp: newLead.createdAt }),
        }).catch((e) => console.debug("Webhook dispatch error:", e));
      }
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  }

  return newLead;
}

export function updateLeadStatus(id: string, status: Lead["status"]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLeads();
    const updated = current.map((lead) => (lead.id === id ? { ...lead, status } : lead));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: updated }));
  } catch (err) {
    console.error("Failed to update lead status:", err);
  }
}

export function updateLeadNotes(id: string, notes: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLeads();
    const updated = current.map((lead) => (lead.id === id ? { ...lead, notes } : lead));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: updated }));
  } catch (err) {
    console.error("Failed to update lead notes:", err);
  }
}

export function deleteLead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLeads();
    const updated = current.filter((lead) => lead.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: updated }));
  } catch (err) {
    console.error("Failed to delete lead:", err);
  }
}

export function resetDemoLeads(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
  window.dispatchEvent(new CustomEvent("elvenx_leads_updated", { detail: INITIAL_DEMO_LEADS }));
}

/**
 * Builds formatted WhatsApp notification dispatch URL for the site owner
 */
export function createOwnerWhatsAppNotificationUrl(lead: {
  name: string;
  phone: string;
  email: string;
  services: string[];
  budget: string;
  message: string;
  createdAt?: string;
}): string {
  const dateFormatted = new Date(lead.createdAt || Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines = [
    `⚡ *NEW WEBSITE INQUIRY — THE ELVENX STUDIO*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Client Name:* ${lead.name}`,
    `📱 *Phone / WhatsApp:* ${lead.phone}`,
    `✉️ *Email:* ${lead.email}`,
    `💼 *Interested Services:* ${lead.services.length > 0 ? lead.services.join(", ") : "Website & Brand"}`,
    `💰 *Budget Range:* ${lead.budget || "Not specified"}`,
    ``,
    `📝 *Project Brief:*`,
    `"${lead.message}"`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🕒 *Received:* ${dateFormatted}`,
  ];

  return `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * Builds direct WhatsApp chat link to reply back to the customer
 */
export function createCustomerReplyWhatsAppUrl(phone: string, clientName: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = `Hello ${clientName}, thank you for reaching out to The ElvenX Studio! We received your project details and would love to connect with you regarding your new website.`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Exports current leads into a downloadable CSV
 */
export function exportLeadsToCSV(leads: Lead[]): void {
  if (typeof window === "undefined" || leads.length === 0) return;

  const headers = ["ID", "Name", "Phone", "Email", "Services", "Budget", "Message", "Status", "Date", "Notes"];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.services.join(", ").replace(/"/g, '""')}"`,
    `"${(l.budget || "").replace(/"/g, '""')}"`,
    `"${l.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
    `"${l.status}"`,
    `"${new Date(l.createdAt).toLocaleString("en-IN")}"`,
    `"${(l.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elvenx_leads_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
