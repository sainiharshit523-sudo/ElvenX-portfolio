import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  getLeads,
  fetchRemoteLeads,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  deleteLeadAsync,
  clearAllLeads,
  clearAllLeadsAsync,
  exportLeadsToCSV,
  exportLeadsToJSON,
  getAdminCredentials,
  saveAdminCredentials,
  resetAdminCredentialsToDefault,
  validateAdminLogin,
  getStudioProfileSettings,
  saveStudioProfileSettings,
  type StudioProfileSettings,
  DEFAULT_STUDIO_PROFILE,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  createOwnerWhatsAppNotificationUrl,
  createCustomerReplyWhatsAppUrl,
  getNotificationConfig,
  saveNotificationConfig,
  type NotificationConfig,
  OWNER_DISPLAY_PHONE,
  OWNER_WHATSAPP_NUMBER,
  type Lead,
} from "@/lib/leads";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
  getSupabaseClient,
  SUPABASE_LEADS_SQL_SCHEMA,
  type SupabaseConfig,
} from "@/lib/supabase";

function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.debug("Audio chime suppressed:", err);
  }
}

export const Route = createFileRoute("/studio-portal-2026")({
  head: () => ({
    meta: [
      { title: "Studio Command & Leads Vault — The ElvenX Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StudioPortalPage,
});

const PORTAL_AUTH_KEY = "elvenx_studio_portal_auth_v2";

type FilterTab = "all" | "new" | "in-discussion" | "contacted" | "converted" | "archived";

function StudioPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Settings Modal State
  type SettingsTab = "general" | "security" | "notifications" | "database" | "data";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("general");
  const [newLeadAlert, setNewLeadAlert] = useState<Lead | null>(null);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>(getNotificationConfig());
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission | "unsupported">("default");

  // Studio Profile & Portal Preferences State
  const [studioSettings, setStudioSettings] = useState<StudioProfileSettings>(getStudioProfileSettings());
  const [studioNotice, setStudioNotice] = useState<string | null>(null);

  // Supabase Cloud Sync State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState<{ testing: boolean; message: string | null; success?: boolean }>({
    testing: false,
    message: null,
  });
  const [isCloudActive, setIsCloudActive] = useState<boolean>(isSupabaseConfigured());
  const [copiedSql, setCopiedSql] = useState(false);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Clear data double-confirmation state
  const [clearConfirmationStep, setClearConfirmationStep] = useState<"initial" | "confirming">("initial");

  // Load session auth and leads on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. One-tap mobile access token via URL (?key=elvenx2026 or ?auth=admin)
      try {
        const params = new URLSearchParams(window.location.search);
        const quickKey = params.get("key") || params.get("auth") || params.get("token");
        if (quickKey && ["elvenx2026", "studio2026", "admin", "elvenx"].includes(quickKey.toLowerCase())) {
          setIsAuthenticated(true);
          sessionStorage.setItem(PORTAL_AUTH_KEY, "true");
          localStorage.setItem(PORTAL_AUTH_KEY, "true");
          triggerNotice("Signed in via Secure Mobile Quick-Access Key");
        }
      } catch {
        // Safe
      }

      // 2. Persistent storage for mobile browsers (survives app & tab switching)
      const storedAuth =
        sessionStorage.getItem(PORTAL_AUTH_KEY) === "true" ||
        localStorage.getItem(PORTAL_AUTH_KEY) === "true";
      if (storedAuth) {
        setIsAuthenticated(true);
      }
      setLeads(getLeads());

      // Fetch remote leads from Supabase cloud database
      fetchRemoteLeads().then((rem) => {
        setLeads(rem);
      });

      // Poll cloud leads periodically every 10 seconds so mobile inquiries appear automatically
      const cloudPollInterval = setInterval(() => {
        fetchRemoteLeads().then((rem) => {
          setLeads(rem);
        });
      }, 10000);

      // Listen for Supabase Realtime broadcast events
      const supabase = getSupabaseClient();
      let realtimeChannel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
      if (supabase) {
        realtimeChannel = supabase
          .channel("realtime-leads-portal")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "leads" },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              if (row) {
                const incomingLead: Lead = {
                  id: String(row.id),
                  name: String(row.name || "Client"),
                  phone: String(row.phone || ""),
                  email: String(row.email || ""),
                  services: Array.isArray(row.services) ? (row.services as string[]) : [],
                  budget: String(row.budget || "Flexible"),
                  message: String(row.message || ""),
                  status: (row.status || "new") as Lead["status"],
                  notes: typeof row.notes === "string" ? row.notes : "",
                  createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
                };
                setNewLeadAlert(incomingLead);
                playNotificationChime();
                fetchRemoteLeads().then((l) => setLeads(l));
              }
            }
          )
          .subscribe();
      }

      if ("Notification" in window) {
        setBrowserPerm(Notification.permission);
      } else {
        setBrowserPerm("unsupported");
      }

      const creds = getAdminCredentials();
      setNewUsername(creds.username);

      const handleLeadsUpdated = () => {
        setLeads(getLeads());
      };
      const handleCredsUpdated = () => {
        const updated = getAdminCredentials();
        setNewUsername(updated.username);
      };

      const handleNewLeadReceived = (e: Event) => {
        const customEvt = e as CustomEvent<Lead>;
        const incoming = customEvt.detail;
        if (!incoming) return;

        setNewLeadAlert(incoming);
        setLeads(getLeads());

        const currentCfg = getNotificationConfig();
        if (currentCfg.soundEnabled) {
          playNotificationChime();
        }

        if (
          currentCfg.browserNotificationsEnabled &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            const notif = new Notification(`⚡ New Lead: ${incoming.name}`, {
              body: `${incoming.services.join(", ") || "Inquiry"} • ${incoming.budget}\n"${incoming.message.slice(0, 90)}..."`,
              icon: "/apple-touch-icon.png",
              tag: `lead-${incoming.id}`,
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (err) {
            console.debug("Desktop notification error:", err);
          }
        }
      };

      const handleStudioUpdated = (e: Event) => {
        const customEvt = e as CustomEvent<StudioProfileSettings>;
        if (customEvt.detail) {
          setStudioSettings(customEvt.detail);
        }
      };

      window.addEventListener("elvenx_leads_updated", handleLeadsUpdated);
      window.addEventListener("elvenx_credentials_updated", handleCredsUpdated);
      window.addEventListener("elvenx_new_lead_received", handleNewLeadReceived);
      window.addEventListener("elvenx_studio_profile_updated", handleStudioUpdated);
      return () => {
        clearInterval(cloudPollInterval);
        if (supabase && realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
        }
        window.removeEventListener("elvenx_leads_updated", handleLeadsUpdated);
        window.removeEventListener("elvenx_credentials_updated", handleCredsUpdated);
        window.removeEventListener("elvenx_new_lead_received", handleNewLeadReceived);
        window.removeEventListener("elvenx_studio_profile_updated", handleStudioUpdated);
      };
    }
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateAdminLogin(username, password);

    if (res.isValid) {
      setIsAuthenticated(true);
      setAuthError("");
      try {
        sessionStorage.setItem(PORTAL_AUTH_KEY, "true");
        localStorage.setItem(PORTAL_AUTH_KEY, "true");
      } catch {
        // Safe for iOS Safari private browsing mode
      }
      triggerNotice(`Welcome back, ${res.matchedUsername}!`);
    } else {
      setAuthError(
        "Incorrect username or password. On mobile, you can sign in simply with Username: admin and Password: admin or elvenx2026 (or your master password)."
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(PORTAL_AUTH_KEY);
      localStorage.removeItem(PORTAL_AUTH_KEY);
    } catch {
      // Safe
    }
  };

  const handleSaveStudioSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStudioProfileSettings(studioSettings);
    setStudioNotice("Studio profile and operational preferences saved successfully!");
    triggerNotice("Studio settings updated");
    setTimeout(() => setStudioNotice(null), 4000);
  };

  const handleResetToMasterCredentials = () => {
    if (
      window.confirm(
        `Reset admin credentials back to default master?\n\nUsername: ${DEFAULT_ADMIN_USERNAME}\nPassword: ${DEFAULT_ADMIN_PASSWORD}`
      )
    ) {
      const res = resetAdminCredentialsToDefault();
      if (res.success) {
        setNewUsername(DEFAULT_ADMIN_USERNAME);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwdStatus({
          type: "success",
          message: `Credentials successfully reset to master default (${DEFAULT_ADMIN_USERNAME}).`,
        });
        triggerNotice("Credentials reset to master default");
      }
    }
  };

  // Password & Username change handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    const creds = getAdminCredentials();

    if (currentPassword !== creds.password) {
      setPwdStatus({ type: "error", message: "Current password is incorrect." });
      return;
    }

    const targetUser = newUsername.trim() || creds.username;
    if (targetUser.length < 3) {
      setPwdStatus({ type: "error", message: "Username must be at least 3 characters." });
      return;
    }

    if (!newPassword) {
      setPwdStatus({ type: "error", message: "Please enter a new password." });
      return;
    }

    if (newPassword.length < 8) {
      setPwdStatus({ type: "error", message: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    const res = saveAdminCredentials(targetUser, newPassword);
    if (res.success) {
      setPwdStatus({ type: "success", message: "Credentials successfully updated and saved!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      triggerNotice("Admin credentials updated");
    } else {
      setPwdStatus({ type: "error", message: res.message });
    }
  };

  // Clear data handler
  const handleClearAllData = async () => {
    if (clearConfirmationStep === "initial") {
      setClearConfirmationStep("confirming");
      return;
    }

    triggerNotice("Clearing all inquiries from cloud database...");
    await clearAllLeadsAsync();
    setLeads([]);
    setClearConfirmationStep("initial");
    triggerNotice("All inquiries have been permanently cleared.");
  };

  // Supabase Cloud Connection & Sync Handler
  const handleSaveSupabaseConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSupabaseStatus({ testing: true, message: "Testing connection to Supabase..." });
    const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
    saveSupabaseConfig(supabaseConfig);
    setIsCloudActive(isSupabaseConfigured());
    setSupabaseStatus({ testing: false, message: res.message, success: res.success });
    if (res.success) {
      triggerNotice("Cloud Database connected! Syncing inquiries...");
      const remote = await fetchRemoteLeads();
      setLeads(remote);
    }
  };

  const handleStatusChange = async (id: string, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    triggerNotice(`Lead status updated to "${status}"`);
    await updateLeadStatus(id, status);
  };

  const handleNotesSave = async (id: string) => {
    if (editingNotes[id] !== undefined) {
      const noteVal = editingNotes[id]!;
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: noteVal } : l)));
      triggerNotice("Notes saved");
      await updateLeadNotes(id, noteVal);
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete inquiry from ${name}?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      triggerNotice("Deleting inquiry from database...");
      await deleteLeadAsync(id);
      triggerNotice("Lead permanently removed");
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesTab = activeTab === "all" ? true : lead.status === activeTab;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q) ||
        lead.services.some((s) => s.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [leads, activeTab, search]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const active = leads.filter((l) => l.status === "in-discussion" || l.status === "contacted").length;
    const converted = leads.filter((l) => l.status === "converted").length;
    return { total, newCount, active, converted };
  }, [leads]);

  // Password strength checker helper
  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { label: "Weak", color: "text-red-400 bg-red-400/20" };
    if (score <= 4) return { label: "Medium", color: "text-amber-400 bg-amber-400/20" };
    return { label: "Strong & Secure", color: "text-emerald-400 bg-emerald-400/20" };
  }, [newPassword]);

  // ==========================================
  // LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[92vh] items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg border border-border bg-card p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src="/apple-touch-icon.png"
                alt="The ElvenX Studio"
                className="h-12 w-12 rounded-xl border border-border/80 object-cover shadow-lg"
              />
              <div>
                <span className="label text-primary font-mono block text-xs">(Private Studio Portal)</span>
                <span className="text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5">
                  SECURE ROUTE
                </span>
              </div>
            </div>
            <h1 className="display text-3xl md:text-4xl text-foreground">
              Admin <span className="text-primary">Vault</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Enter your administrator credentials to access client inquiries, real-time WhatsApp hotline records, and portal settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="label block mb-2 text-xs" htmlFor="portal-username">
                Admin Username
              </label>
              <input
                id="portal-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                autoComplete="username"
                className="w-full border border-border bg-background px-4 py-3 font-mono text-base outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-xs" htmlFor="portal-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  {showLoginPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  id="portal-password"
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  className="w-full border border-border bg-background px-4 py-3 font-mono text-base outline-none focus:border-primary transition-colors text-foreground pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 px-2 py-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors select-none"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {authError && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive font-mono leading-relaxed">
                ⚠ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary px-6 py-4 font-display text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign In to Studio Portal →
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD MAIN SCREEN
  // ==========================================
  return (
    <div className="min-h-screen px-5 pb-32 pt-10 md:px-10">
      {/* Top Banner & Header */}
      <header className="mb-10 border-b border-border pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/apple-touch-icon.png"
                alt="The ElvenX Studio"
                className="h-7 w-7 rounded-lg border border-border/70 object-cover"
              />
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="label text-primary">(Private Portal · /studio-portal-2026)</span>
            </div>
            <h1 className="display mt-2 text-4xl md:text-6xl text-foreground">
              Studio <span className="text-primary">Inquiries Vault</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Confidential client inquiry registry synchronized with the studio owner hotline (
              <strong className="text-foreground">{OWNER_DISPLAY_PHONE}</strong>).
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* CLOUD DATABASE SYNC STATUS BADGE */}
            <button
              type="button"
              onClick={() => {
                setSettingsTab("database");
                setIsSettingsOpen(true);
              }}
              className={`flex items-center gap-2 border px-3 py-2 label transition-all ${
                isCloudActive
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 animate-pulse"
              }`}
              title="Cloud Database Sync Status"
            >
              <span className={`h-2 w-2 rounded-full ${isCloudActive ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{isCloudActive ? "☁️ Cloud Synced" : "⚠️ Local Only (Setup Cloud)"}</span>
            </button>

            {/* MANUAL CLOUD SYNC BUTTON */}
            <button
              type="button"
              onClick={async () => {
                triggerNotice("Connecting to Supabase...");
                try {
                  const refreshed = await fetchRemoteLeads();
                  setLeads(refreshed);
                  setIsCloudActive(isSupabaseConfigured());
                  triggerNotice(`✓ Synced ${refreshed.length} lead${refreshed.length === 1 ? "" : "s"} from Supabase Cloud`);
                } catch {
                  triggerNotice("Failed to sync leads from cloud");
                }
              }}
              className="flex items-center gap-2 border border-border bg-card/60 px-3 py-2 label text-foreground hover:border-primary transition-colors"
              title="Manually fetch latest leads from Supabase Cloud"
            >
              <span>↻ Sync Leads</span>
            </button>

            {/* SETTINGS BUTTON */}
            <button
              type="button"
              onClick={() => {
                setSettingsTab("general");
                setIsSettingsOpen(true);
                setPwdStatus(null);
                setClearConfirmationStep("initial");
              }}
              className="flex items-center gap-2 border-2 border-primary bg-primary/10 px-4 py-2 label text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
              title="Open Studio Admin Settings (Profile, Security, WhatsApp, Preferences)"
            >
              <span>⚙️ Settings</span>
            </button>

            <a
              href={`https://wa.me/${OWNER_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 label text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <span>WhatsApp Hotline</span>
            </a>

            <Link
              to="/"
              className="border border-border bg-card px-4 py-2 label hover:border-primary transition-colors"
            >
              View Site ↗
            </Link>

            <button
              onClick={handleLogout}
              className="border border-border bg-card px-4 py-2 label text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            >
              Lock / Sign Out
            </button>
          </div>
        </div>

        {/* Real-time New Lead Alert Banner */}
        {newLeadAlert && (
          <div className="mt-6 border-2 border-emerald-500 bg-emerald-500/10 p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  ⚡ New Client Inquiry Received: <span className="text-emerald-400">{newLeadAlert.name}</span> ({newLeadAlert.budget})
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{newLeadAlert.message}"
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={createOwnerWhatsAppNotificationUrl(newLeadAlert)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] px-4 py-2 font-display text-xs font-semibold text-black hover:bg-[#20ba59] transition-colors"
                title="Open WhatsApp notification with this lead's details"
              >
                <span>📲 Forward to Owner WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => playNotificationChime()}
                className="border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
                title="Play notification sound"
              >
                🔔 Sound
              </button>
              <button
                type="button"
                onClick={() => setNewLeadAlert(null)}
                className="border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Dismiss ✕
              </button>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="border border-border bg-card p-5">
            <span className="label text-muted-foreground">Total Inquiries</span>
            <p className="display mt-3 text-4xl text-foreground">{stats.total}</p>
            <span className="text-xs text-muted-foreground mt-1 block">Logged in local portal</span>
          </div>

          <div className="border border-border bg-card p-5">
            <span className="label text-emerald-400">New / Unread Leads</span>
            <p className="display mt-3 text-4xl text-emerald-400">{stats.newCount}</p>
            <span className="text-xs text-muted-foreground mt-1 block">Awaiting initial reply</span>
          </div>

          <div className="border border-border bg-card p-5">
            <span className="label text-blue-400">In Discussion</span>
            <p className="display mt-3 text-4xl text-blue-400">{stats.active}</p>
            <span className="text-xs text-muted-foreground mt-1 block">Active project proposals</span>
          </div>

          <div className="border border-border bg-card p-5">
            <span className="label text-purple-400">Converted Projects</span>
            <p className="display mt-3 text-4xl text-purple-400">{stats.converted}</p>
            <span className="text-xs text-muted-foreground mt-1 block">Signed client engagements</span>
          </div>
        </div>
      </header>

      {/* Floating Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 border border-primary bg-card px-5 py-3 shadow-2xl label text-primary font-mono animate-in fade-in slide-in-from-bottom-3">
          ✓ {actionNotice}
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: `All (${stats.total})` },
                { id: "new", label: `New (${stats.newCount})` },
                { id: "in-discussion", label: "In Discussion" },
                { id: "contacted", label: "Contacted" },
                { id: "converted", label: `Converted (${stats.converted})` },
                { id: "archived", label: "Archived" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`label border px-4 py-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary bg-primary !text-primary-foreground font-semibold"
                    : "border-border bg-card hover:!text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportLeadsToCSV(leads)}
              className="border border-border bg-card px-4 py-2 label hover:border-primary transition-colors"
              title="Download spreadsheet"
            >
              Export CSV ↓
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="border border-border bg-card px-4 py-2 label hover:border-primary text-muted-foreground hover:text-foreground transition-colors"
            >
              ⚙️ Settings &amp; Data
            </button>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone number, service, budget or brief..."
            className="w-full border border-border bg-card px-4 py-3 text-base font-mono outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60 text-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-3 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Main Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="border border-dashed border-border p-16 text-center">
          <p className="font-display text-2xl text-muted-foreground">No customer inquiries found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "No leads matched your search query."
              : "New inquiries submitted through the website contact form will appear here automatically."}
          </p>
          {search && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setSearch("")}
                className="border border-border px-4 py-2 label hover:border-primary transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLeads.map((lead) => {
            const statusColors: Record<Lead["status"], string> = {
              new: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
              contacted: "border-amber-500/50 bg-amber-500/10 text-amber-400",
              "in-discussion": "border-blue-500/50 bg-blue-500/10 text-blue-400",
              converted: "border-purple-500/50 bg-purple-500/10 text-purple-400",
              archived: "border-zinc-700 bg-zinc-800/40 text-zinc-400",
            };

            const ownerWhatsAppUrl = createOwnerWhatsAppNotificationUrl(lead);
            const customerReplyUrl = createCustomerReplyWhatsAppUrl(lead.phone, lead.name);

            return (
              <article
                key={lead.id}
                className="border border-border bg-card p-6 md:p-8 transition-colors hover:border-foreground/20"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl md:text-3xl text-foreground">{lead.name}</h2>
                      <span className={`label border px-2.5 py-0.5 text-xs font-mono uppercase ${statusColors[lead.status]}`}>
                        {lead.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-mono text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        📱 <strong className="text-foreground">{lead.phone}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        ✉️{" "}
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-foreground underline decoration-border hover:decoration-primary"
                        >
                          {lead.email}
                        </a>
                      </span>
                      <span>
                        🕒 {new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown & Delete */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs label text-muted-foreground" htmlFor={`status-${lead.id}`}>
                      Status:
                    </label>
                    <select
                      id={`status-${lead.id}`}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead["status"])}
                      className="border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in-discussion">In Discussion</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      className="text-xs text-muted-foreground hover:text-destructive p-1.5"
                      title="Delete inquiry"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Project Brief & Message */}
                <div className="grid gap-6 pt-6 lg:grid-cols-12">
                  <div className="space-y-4 lg:col-span-8">
                    <div>
                      <span className="label text-muted-foreground text-xs block mb-1">Project Brief &amp; Requirements</span>
                      <div className="border border-border/60 bg-background/50 p-4 text-base font-sans text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        "{lead.message}"
                      </div>
                    </div>

                    {/* Services and budget */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-muted-foreground mr-2">Budget:</span>
                        <span className="border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
                          {lead.budget || "Not specified"}
                        </span>
                      </div>
                      {lead.services.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-muted-foreground mr-1">Services:</span>
                          {lead.services.map((s) => (
                            <span key={s} className="border border-border bg-card px-2 py-0.5 text-foreground">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Response Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <a
                        href={customerReplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border border-[#25D366] bg-[#25D366]/10 px-4 py-2.5 font-display text-sm font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-black transition-colors"
                      >
                        <span>💬 Message Client on WhatsApp</span>
                      </a>

                      <a
                        href={`mailto:${lead.email}?subject=${encodeURIComponent("Website Project Inquiry — The ElvenX Studio")}&body=${encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out to The ElvenX Studio regarding your website project. We reviewed your requirements and would love to connect with you.\n\nBest regards,\nThe ElvenX Studio`)}`}
                        className="flex items-center gap-2 border border-border px-4 py-2.5 label hover:border-primary transition-colors"
                      >
                        <span>✉️ Send Email</span>
                      </a>

                      <a
                        href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                        className="flex items-center gap-2 border border-border px-4 py-2.5 label hover:border-primary transition-colors"
                      >
                        <span>📞 Call</span>
                      </a>

                      <a
                        href={ownerWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-2 underline underline-offset-4"
                        title="Resend this lead notification to owner WhatsApp hotline"
                      >
                        <span>📲 Resend to Owner WhatsApp Hotline</span>
                      </a>
                    </div>
                  </div>

                  {/* Team Internal Notes Column */}
                  <div className="lg:col-span-4 border-t border-border lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 space-y-2">
                    <span className="label text-xs text-muted-foreground">Internal Studio Notes</span>
                    <textarea
                      rows={4}
                      value={editingNotes[lead.id] !== undefined ? editingNotes[lead.id] : lead.notes || ""}
                      onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                      placeholder="Add private studio notes, meeting times, scope negotiations..."
                      className="w-full border border-border bg-background p-3 text-xs font-mono outline-none focus:border-primary resize-none placeholder:text-muted-foreground/50 text-foreground"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleNotesSave(lead.id)}
                        className="border border-border bg-card px-3 py-1 label text-xs hover:border-primary transition-colors"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* SETTINGS MODAL (Password Change + Clear All Data)         */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-6 bg-background/40">
              <div>
                <span className="label text-primary font-mono">(Configuration Vault)</span>
                <h2 className="display mt-1 text-2xl md:text-3xl text-foreground">Portal Settings</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="h-10 w-10 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors font-mono"
                title="Close settings"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-border bg-background/20 px-6 pt-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSettingsTab("general")}
                className={`label border-b-2 pb-3 px-3 transition-colors shrink-0 ${
                  settingsTab === "general"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                🏛️ Studio &amp; Operations
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("security")}
                className={`label border-b-2 pb-3 px-3 transition-colors shrink-0 ${
                  settingsTab === "security"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                🔐 Password &amp; Security
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("notifications")}
                className={`label border-b-2 pb-3 px-3 transition-colors shrink-0 ${
                  settingsTab === "notifications"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                🔔 Notifications &amp; WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("database")}
                className={`label border-b-2 pb-3 px-3 transition-colors shrink-0 ${
                  settingsTab === "database"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                ☁️ Cloud Database (Supabase)
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("data")}
                className={`label border-b-2 pb-3 px-3 transition-colors shrink-0 ${
                  settingsTab === "data"
                    ? "border-destructive text-destructive font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                🗑️ Clear &amp; Manage Data
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* TAB 1: STUDIO PROFILE & GENERAL ADMIN PREFERENCES */}
              {settingsTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <span className="label text-primary font-mono block">🏛️ Studio Identity &amp; Portal Preferences</span>
                    <h3 className="font-display text-xl text-foreground mt-1">General Admin Settings</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Configure your official studio brand parameters, client contact endpoints, and dashboard refresh behaviors.
                    </p>
                  </div>

                  {studioNotice && (
                    <div className="p-3 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                      ✓ {studioNotice}
                    </div>
                  )}

                  <form onSubmit={handleSaveStudioSettings} className="space-y-4">
                    {/* Studio Brand Name */}
                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="studio-name">
                        Studio Brand Name
                      </label>
                      <input
                        id="studio-name"
                        type="text"
                        value={studioSettings.studioName}
                        onChange={(e) => setStudioSettings({ ...studioSettings, studioName: e.target.value })}
                        placeholder="e.g. The ElvenX Studio"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                    </div>

                    {/* Contact Email & Hotline Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="studio-email">
                          Official Studio Email
                        </label>
                        <input
                          id="studio-email"
                          type="email"
                          value={studioSettings.studioEmail}
                          onChange={(e) => setStudioSettings({ ...studioSettings, studioEmail: e.target.value })}
                          placeholder="e.g. thelvenxstudio2026@gmail.com"
                          required
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="studio-phone">
                          Studio Display Phone
                        </label>
                        <input
                          id="studio-phone"
                          type="text"
                          value={studioSettings.studioPhone}
                          onChange={(e) => setStudioSettings({ ...studioSettings, studioPhone: e.target.value })}
                          placeholder="e.g. +91 81465 87076"
                          required
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>

                    {/* Studio Location & Availability */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="studio-loc">
                          Studio Location / Coverage
                        </label>
                        <input
                          id="studio-loc"
                          type="text"
                          value={studioSettings.studioLocation}
                          onChange={(e) => setStudioSettings({ ...studioSettings, studioLocation: e.target.value })}
                          placeholder="e.g. Remote — Available Worldwide"
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="studio-avail">
                          Booking Status Label
                        </label>
                        <input
                          id="studio-avail"
                          type="text"
                          value={studioSettings.availabilityStatus}
                          onChange={(e) => setStudioSettings({ ...studioSettings, availabilityStatus: e.target.value })}
                          placeholder="e.g. Accepting select projects for Q1 2027"
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                        />
                      </div>
                    </div>

                    {/* Intake Status Switch */}
                    <div className="border border-border bg-background/50 p-4 flex items-center justify-between">
                      <div>
                        <span className="label text-xs text-primary font-mono block">📥 Client Intake Status</span>
                        <span className="text-xs text-muted-foreground">
                          {studioSettings.acceptingLeads ? "Currently accepting new client inquiries" : "Lead intake temporarily paused"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setStudioSettings({ ...studioSettings, acceptingLeads: !studioSettings.acceptingLeads })
                        }
                        className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                          studioSettings.acceptingLeads
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                            : "border-amber-500 bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {studioSettings.acceptingLeads ? "Active (Accepting)" : "Paused"}
                      </button>
                    </div>

                    {/* Auto-Refresh Frequency & Card Density */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="auto-refresh">
                          Inquiries Auto-Sync Frequency
                        </label>
                        <select
                          id="auto-refresh"
                          value={studioSettings.autoRefreshSeconds}
                          onChange={(e) =>
                            setStudioSettings({ ...studioSettings, autoRefreshSeconds: Number(e.target.value) })
                          }
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-xs outline-none focus:border-primary text-foreground"
                        >
                          <option value={5}>Every 5 seconds (Fastest)</option>
                          <option value={10}>Every 10 seconds (Recommended)</option>
                          <option value={30}>Every 30 seconds</option>
                          <option value={60}>Every 60 seconds</option>
                          <option value={0}>Manual Only (No Auto-Poll)</option>
                        </select>
                      </div>

                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="compact-view">
                          Inquiry Cards Display Layout
                        </label>
                        <select
                          id="compact-view"
                          value={studioSettings.compactView ? "compact" : "standard"}
                          onChange={(e) =>
                            setStudioSettings({ ...studioSettings, compactView: e.target.value === "compact" })
                          }
                          className="w-full border border-border bg-background px-4 py-2.5 font-mono text-xs outline-none focus:border-primary text-foreground"
                        >
                          <option value="standard">Standard (Full Message &amp; Badges)</option>
                          <option value="compact">Compact (Space Efficient)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        className="bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        Save Studio &amp; Portal Settings →
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioSettings(DEFAULT_STUDIO_PROFILE);
                          saveStudioProfileSettings(DEFAULT_STUDIO_PROFILE);
                          setStudioNotice("Reset to default studio settings.");
                          setTimeout(() => setStudioNotice(null), 3000);
                        }}
                        className="border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: SUPABASE CLOUD DATABASE CONFIGURATION */}
              {settingsTab === "database" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="label text-primary font-mono block">☁️ Universal Multi-Device Sync</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border ${
                          isCloudActive
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {isCloudActive ? "CONNECTED" : "NOT CONNECTED"}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-foreground mt-1">
                      Supabase Cloud Database &amp; Real-time Sync
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Connect your Supabase database so inquiries submitted from any visitor's mobile phone, tablet, or browser are securely saved and appear here instantly in real time.
                    </p>
                  </div>

                  {/* Status Banner */}
                  <div
                    className={`p-4 border font-mono text-xs space-y-1 ${
                      isCloudActive
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    <p className="font-semibold">
                      {isCloudActive ? "✓ Cloud Database Active" : "⚠️ Local Storage Only (No Cloud Connection)"}
                    </p>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      {isCloudActive
                        ? "Universal sync is active. Inquiries sent from phones anywhere in the world will save to your Supabase leads table and push live to this dashboard."
                        : "Currently, inquiries sent from a mobile device remain only inside that specific phone's local storage and will NOT reach this admin panel. Provide your Supabase project credentials below to enable live cloud sync."}
                    </p>
                  </div>

                  {supabaseStatus.message && (
                    <div
                      className={`p-3 border font-mono text-xs ${
                        supabaseStatus.success
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-destructive/50 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {supabaseStatus.success ? "✓" : "⚠"} {supabaseStatus.message}
                    </div>
                  )}

                  {/* Supabase Credentials Form */}
                  <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="supabase-url">
                        Supabase Project URL *
                      </label>
                      <input
                        id="supabase-url"
                        type="url"
                        value={supabaseConfig.url}
                        onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value.trim() })}
                        placeholder="https://abcdefghijklm.supabase.co"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Found in Supabase Dashboard → Project Settings → Configuration → API → Project URL
                      </span>
                    </div>

                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="supabase-anon-key">
                        Supabase Anon / Public Key *
                      </label>
                      <input
                        id="supabase-anon-key"
                        type="password"
                        value={supabaseConfig.anonKey}
                        onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value.trim() })}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Found in Supabase Dashboard → Project Settings → Configuration → API → Project API Keys (anon public)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={supabaseStatus.testing}
                        className="bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {supabaseStatus.testing ? "Testing Connection..." : "Test Connection & Save Credentials →"}
                      </button>

                      {isCloudActive && (
                        <button
                          type="button"
                          onClick={async () => {
                            triggerNotice("Syncing remote leads...");
                            const fresh = await fetchRemoteLeads();
                            setLeads(fresh);
                            triggerNotice(`Synced ${fresh.length} leads from cloud database`);
                          }}
                          className="border border-border bg-card px-4 py-3 font-mono text-xs hover:border-primary text-foreground transition-colors"
                        >
                          🔄 Force Refresh Leads
                        </button>
                      )}
                    </div>
                  </form>

                  {/* SQL Setup Instructions Box */}
                  <div className="border border-border bg-background/50 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="label text-xs text-primary font-mono block">🛠️ Database Table Setup (One-Time)</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          In your Supabase project, go to <strong>SQL Editor</strong>, paste this script and click <strong>Run</strong>:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(SUPABASE_LEADS_SQL_SCHEMA);
                            setCopiedSql(true);
                            triggerNotice("SQL schema copied to clipboard!");
                            setTimeout(() => setCopiedSql(false), 3000);
                          }
                        }}
                        className="border border-border bg-card px-3 py-1.5 text-xs font-mono hover:border-primary transition-colors text-foreground flex items-center gap-1.5"
                      >
                        <span>{copiedSql ? "✓ Copied!" : "📋 Copy SQL"}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="max-h-56 overflow-y-auto p-4 bg-black/60 border border-border text-[11px] font-mono text-muted-foreground whitespace-pre leading-relaxed select-all">
                        {SUPABASE_LEADS_SQL_SCHEMA}
                      </pre>
                    </div>

                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <p>✨ <strong>What this SQL does:</strong></p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        <li>Creates the secure <code className="text-primary font-mono">public.leads</code> table.</li>
                        <li>Configures Row Level Security (RLS) so visitors can submit inquiries safely.</li>
                        <li>Enables Realtime broadcast so incoming mobile inquiries alert your dashboard live.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Lovable Cloud / Environment Variables Note */}
                  <div className="border border-border/70 bg-card/40 p-4 text-xs space-y-2">
                    <span className="label text-[11px] text-primary block">💡 Permanent Deployment Configuration</span>
                    <p className="text-muted-foreground leading-relaxed">
                      For permanent automatic multi-device syncing across all mobile visitors when deploying on <strong>Lovable</strong>, simply add these two Environment Variables in your project or hosting dashboard:
                    </p>
                    <div className="font-mono text-[11px] bg-black/50 p-2.5 border border-border space-y-1">
                      <p><span className="text-primary">VITE_SUPABASE_URL</span>=https://your-project.supabase.co</p>
                      <p><span className="text-primary">VITE_SUPABASE_ANON_KEY</span>=your-anon-public-key</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: PASSWORD & USERNAME CHANGE SECTION */}
              {settingsTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl text-foreground">Change Security Credentials</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Update your administrator username or strong password. Changes persist in your browser vault and take effect immediately.
                    </p>
                  </div>

                  {pwdStatus && (
                    <div
                      className={`p-3 border font-mono text-xs ${
                        pwdStatus.type === "success"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                          : "border-destructive/50 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {pwdStatus.type === "success" ? "✓" : "⚠"} {pwdStatus.message}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="current-pwd">
                        Current Password *
                      </label>
                      <input
                        id="current-pwd"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                    </div>

                    {/* New Username */}
                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="new-username">
                        Admin Username
                      </label>
                      <input
                        id="new-username"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. elvenx_admin"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="label text-xs text-muted-foreground" htmlFor="new-pwd">
                          New Strong Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-[11px] font-mono text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <input
                        id="new-pwd"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters (uppercase, numbers, symbols)"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                      {passwordStrength && (
                        <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-muted-foreground">Strength:</span>
                          <span className={`px-2 py-0.5 rounded-none font-semibold ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="confirm-pwd">
                        Confirm New Password *
                      </label>
                      <input
                        id="confirm-pwd"
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary text-foreground"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        Update Security Credentials →
                      </button>
                    </div>
                  </form>

                  {/* Master Credentials Reference & Mobile Recovery */}
                  <div className="border border-border bg-background/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="label text-xs text-primary font-mono block">🛡️ Master Credentials Reference</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(`${DEFAULT_ADMIN_USERNAME} / ${DEFAULT_ADMIN_PASSWORD}`);
                            triggerNotice("Master credentials copied to clipboard!");
                          }
                        }}
                        className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                      >
                        📋 Copy Both
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use these default master credentials on any computer, tablet, or mobile phone to gain administrator access.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-card p-2.5 border border-border">
                        <span className="text-muted-foreground text-[11px] block">Master Username:</span>
                        <code className="text-primary font-semibold">{DEFAULT_ADMIN_USERNAME}</code>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">(alias: "admin" or "elvenx")</span>
                      </div>
                      <div className="bg-card p-2.5 border border-border">
                        <span className="text-muted-foreground text-[11px] block">Master Password:</span>
                        <code className="text-primary font-semibold">{DEFAULT_ADMIN_PASSWORD}</code>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="text-[11px] text-muted-foreground">Forgot custom password or need to reset?</span>
                      <button
                        type="button"
                        onClick={handleResetToMasterCredentials}
                        className="border border-border bg-card px-3 py-1.5 text-xs font-mono text-amber-400 hover:border-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Restore Master Default Credentials ↺
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ALERTS & NOTIFICATIONS CONFIG */}
              {settingsTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl text-foreground">Owner Alert &amp; WhatsApp Dispatch Settings</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Configure how you receive alerts when a customer fills out the project form on the main website.
                    </p>
                  </div>

                  {/* 1. Real-time Audio Chime */}
                  <div className="border border-border bg-background/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="label text-xs text-primary font-mono block">🎵 Live Audio Alert</span>
                        <span className="text-xs text-muted-foreground">
                          Plays a synthesized chime whenever a new inquiry pops up in this portal.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playNotificationChime()}
                          className="border border-border bg-card px-3 py-1.5 text-xs font-mono hover:border-primary transition-colors text-foreground"
                        >
                          Play Chime ♫
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...notifConfig, soundEnabled: !notifConfig.soundEnabled };
                            setNotifConfig(updated);
                            saveNotificationConfig(updated);
                            triggerNotice(updated.soundEnabled ? "Audio chime enabled" : "Audio chime muted");
                          }}
                          className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                            notifConfig.soundEnabled
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {notifConfig.soundEnabled ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Desktop Browser Push Notification */}
                  <div className="border border-border bg-background/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="label text-xs text-primary font-mono block">🖥️ Desktop Web Push Notification</span>
                        <span className="text-xs text-muted-foreground">
                          Alerts you on your desktop even if this tab is in the background. Status:{" "}
                          <strong className={browserPerm === "granted" ? "text-emerald-400" : "text-amber-400"}>
                            {browserPerm.toUpperCase()}
                          </strong>
                        </span>
                      </div>
                      {browserPerm !== "granted" ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (typeof window !== "undefined" && "Notification" in window) {
                              const res = await Notification.requestPermission();
                              setBrowserPerm(res);
                              if (res === "granted") {
                                triggerNotice("Desktop notifications granted!");
                                new Notification("The ElvenX Studio", {
                                  body: "Desktop notifications are now active for new client leads!",
                                  icon: "/apple-touch-icon.png",
                                });
                              }
                            }
                          }}
                          className="bg-primary px-3 py-1.5 text-xs font-display font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Enable Notifications
                        </button>
                      ) : (
                        <span className="border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
                          ✓ Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. Automated WhatsApp Delivery to Owner */}
                  <div className="border border-border bg-background/50 p-4 space-y-4">
                    <div>
                      <span className="label text-xs text-emerald-400 font-mono block">📱 Automated WhatsApp Alerts to Owner</span>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Receive instant WhatsApp messages on your personal number whenever a client submits on the website.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="owner-wa-phone">
                          Owner WhatsApp Phone Number
                        </label>
                        <input
                          id="owner-wa-phone"
                          type="text"
                          value={notifConfig.ownerPhone || OWNER_WHATSAPP_NUMBER}
                          onChange={(e) => setNotifConfig({ ...notifConfig, ownerPhone: e.target.value })}
                          placeholder="e.g. 918146587076"
                          className="w-full border border-border bg-background px-4 py-2 text-xs font-mono outline-none focus:border-primary text-foreground"
                        />
                      </div>

                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="callmebot-key">
                          CallMeBot WhatsApp API Key (Free)
                        </label>
                        <input
                          id="callmebot-key"
                          type="text"
                          value={notifConfig.callMeBotApiKey || ""}
                          onChange={(e) => setNotifConfig({ ...notifConfig, callMeBotApiKey: e.target.value })}
                          placeholder="Enter your CallMeBot API key"
                          className="w-full border border-border bg-background px-4 py-2 text-xs font-mono outline-none focus:border-primary text-foreground"
                        />
                        <div className="mt-2 text-[11px] text-muted-foreground bg-card p-3 border border-border space-y-1">
                          <p className="font-semibold text-foreground">💡 How to get your free WhatsApp API key in 30 seconds:</p>
                          <ol className="list-decimal list-inside space-y-0.5">
                            <li>Add CallMeBot to WhatsApp: <strong className="text-primary">+34 644 44 20 89</strong></li>
                            <li>Send this exact WhatsApp message: <code className="bg-background px-1 py-0.5 text-primary">I allow callmebot to send me messages</code></li>
                            <li>CallMeBot will reply with your personal API Key. Paste it above and click Save.</li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <label className="label text-xs block mb-1 text-muted-foreground" htmlFor="webhook-url">
                          Custom Webhook URL (Optional — Make / Zapier / Discord / Slack)
                        </label>
                        <input
                          id="webhook-url"
                          type="url"
                          value={notifConfig.webhookUrl || ""}
                          onChange={(e) => setNotifConfig({ ...notifConfig, webhookUrl: e.target.value })}
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          className="w-full border border-border bg-background px-4 py-2 text-xs font-mono outline-none focus:border-primary text-foreground"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            saveNotificationConfig(notifConfig);
                            triggerNotice("Notification settings saved successfully!");
                          }}
                          className="bg-primary px-6 py-2.5 font-display text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Save Notification Settings →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CLEAR ALL DATA & BACKUP SECTION */}
              {settingsTab === "data" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl text-foreground">Inquiry Storage &amp; Database</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Manage client inquiry records stored in this browser. You can export backups or permanently clear all inquiry records.
                    </p>
                  </div>

                  {/* Backup Card */}
                  <div className="border border-border bg-background/50 p-4 space-y-3">
                    <span className="label text-xs text-primary font-mono">📦 Data Backup Options</span>
                    <p className="text-xs text-muted-foreground">
                      Before clearing any inquiry records, you can export a complete offline copy to prevent data loss.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        onClick={() => {
                          exportLeadsToCSV(leads);
                          triggerNotice("CSV exported");
                        }}
                        className="border border-border bg-card px-4 py-2 text-xs font-mono hover:border-primary transition-colors text-foreground"
                      >
                        Download CSV (.csv) ↓
                      </button>
                      <button
                        onClick={() => {
                          exportLeadsToJSON(leads);
                          triggerNotice("JSON backup exported");
                        }}
                        className="border border-border bg-card px-4 py-2 text-xs font-mono hover:border-primary transition-colors text-foreground"
                      >
                        Download Full JSON Backup (.json) ↓
                      </button>
                    </div>
                  </div>

                  {/* CLEAR ALL DATA SECTION */}
                  <div className="border border-destructive/50 bg-destructive/10 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-mono text-xs font-bold uppercase">
                      <span>⚠️ Danger Zone — Clear All Data</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This will permanently wipe all <strong className="text-foreground">{leads.length} customer inquiry records</strong> from
                      this portal. Once cleared, previous client submissions cannot be recovered unless you have a backup.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {clearConfirmationStep === "initial" ? (
                        <button
                          type="button"
                          onClick={handleClearAllData}
                          className="bg-destructive px-5 py-2.5 label text-destructive-foreground hover:opacity-90 transition-opacity font-semibold"
                        >
                          Clear All Data ({leads.length} Inquiries)
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleClearAllData}
                            className="bg-destructive px-5 py-2.5 label text-destructive-foreground animate-pulse font-bold"
                          >
                            ⚠️ Confirm Permanent Wipe
                          </button>
                          <button
                            type="button"
                            onClick={() => setClearConfirmationStep("initial")}
                            className="border border-border px-4 py-2 label text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-4 bg-background/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="bg-primary px-6 py-2 label text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
