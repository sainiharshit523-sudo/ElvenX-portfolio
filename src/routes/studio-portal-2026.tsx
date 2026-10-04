import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  getLeads,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  clearAllLeads,
  resetDemoLeads,
  exportLeadsToCSV,
  exportLeadsToJSON,
  saveLead,
  getAdminCredentials,
  saveAdminCredentials,
  createOwnerWhatsAppNotificationUrl,
  createCustomerReplyWhatsAppUrl,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  OWNER_DISPLAY_PHONE,
  OWNER_WHATSAPP_NUMBER,
  type Lead,
} from "@/lib/leads";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"security" | "data">("security");

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
      const storedAuth = sessionStorage.getItem(PORTAL_AUTH_KEY);
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
      setLeads(getLeads());

      const creds = getAdminCredentials();
      setNewUsername(creds.username);

      const handleLeadsUpdated = () => {
        setLeads(getLeads());
      };
      const handleCredsUpdated = () => {
        const updated = getAdminCredentials();
        setNewUsername(updated.username);
      };

      window.addEventListener("elvenx_leads_updated", handleLeadsUpdated);
      window.addEventListener("elvenx_credentials_updated", handleCredsUpdated);
      return () => {
        window.removeEventListener("elvenx_leads_updated", handleLeadsUpdated);
        window.removeEventListener("elvenx_credentials_updated", handleCredsUpdated);
      };
    }
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = getAdminCredentials();
    const inputUser = username.trim();
    const inputPass = password;

    if (inputUser === creds.username && inputPass === creds.password) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem(PORTAL_AUTH_KEY, "true");
      triggerNotice(`Welcome back, ${creds.username}!`);
    } else {
      setAuthError("Invalid username or password. Please verify your credentials.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(PORTAL_AUTH_KEY);
  };

  const handleFillDemoCreds = () => {
    const creds = getAdminCredentials();
    setUsername(creds.username);
    setPassword(creds.password);
    setAuthError("");
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
  const handleClearAllData = () => {
    if (clearConfirmationStep === "initial") {
      setClearConfirmationStep("confirming");
      return;
    }

    clearAllLeads();
    setLeads([]);
    setClearConfirmationStep("initial");
    triggerNotice("All inquiries have been permanently cleared.");
  };

  // Reset to demo data
  const handleRestoreDemoData = () => {
    resetDemoLeads();
    setLeads(getLeads());
    setClearConfirmationStep("initial");
    triggerNotice("Sample inquiries restored.");
  };

  const handleStatusChange = (id: string, status: Lead["status"]) => {
    updateLeadStatus(id, status);
    setLeads(getLeads());
    triggerNotice(`Lead status updated to "${status}"`);
  };

  const handleNotesSave = (id: string) => {
    if (editingNotes[id] !== undefined) {
      updateLeadNotes(id, editingNotes[id]!);
      setLeads(getLeads());
      triggerNotice("Notes saved");
    }
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete inquiry from ${name}?`)) {
      deleteLead(id);
      setLeads(getLeads());
      triggerNotice("Lead removed");
    }
  };

  const handleAddSample = () => {
    const demo = saveLead({
      name: `VIP Client ${Math.floor(Math.random() * 900 + 100)}`,
      phone: "+91 98140 " + Math.floor(Math.random() * 89999 + 10000),
      email: `client${Date.now().toString().slice(-4)}@thestudio.in`,
      services: ["Website", "UI/UX", "3D & Motion"],
      budget: "$25–50k",
      message: "We need an avant-garde digital storefront and bespoke WebGL interactions for our upcoming global brand refresh.",
    });
    setLeads(getLeads());
    triggerNotice(`Added sample inquiry for ${demo.name}`);
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
            <div className="flex items-center justify-between">
              <span className="label text-primary font-mono">(Private Studio Portal)</span>
              <span className="text-[11px] font-mono text-muted-foreground border border-border px-2 py-0.5">
                SECURE ROUTE
              </span>
            </div>
            <h1 className="display mt-3 text-3xl md:text-4xl text-foreground">
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
                placeholder="Enter username (e.g. elvenx_admin)"
                autoFocus
                autoComplete="username"
                className="w-full border border-border bg-background px-4 py-3 font-mono text-base outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-xs" htmlFor="portal-password">
                  Strong Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  {showLoginPassword ? "Hide Password" : "Show Password"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="portal-password"
                  type={showLoginPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
                  autoComplete="current-password"
                  className="w-full border border-border bg-background px-4 py-3 font-mono text-base outline-none focus:border-primary transition-colors text-foreground pr-12"
                />
              </div>
            </div>

            {authError && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive font-mono">
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

          {/* Credentials Helper Card */}
          <div className="mt-8 border border-border/70 bg-background/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground font-semibold">🔐 Default Security Credentials</span>
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-xs font-mono text-primary underline hover:opacity-80"
              >
                1-Click Auto Fill
              </button>
            </div>
            <div className="space-y-1 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Username:</span>
                <strong className="text-foreground">{DEFAULT_ADMIN_USERNAME}</strong>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <strong className="text-foreground">{DEFAULT_ADMIN_PASSWORD}</strong>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/80 leading-normal border-t border-border/40 pt-2">
              Tip: You can change this username and password anytime in the new <strong>⚙️ Settings</strong> panel after logging in.
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-center">
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
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
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
            {/* SETTINGS BUTTON */}
            <button
              onClick={() => {
                setIsSettingsOpen(true);
                setPwdStatus(null);
                setClearConfirmationStep("initial");
              }}
              className="flex items-center gap-2 border-2 border-primary bg-primary/10 px-4 py-2 label text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
              title="Open Admin Settings (Password change, clear data)"
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
              onClick={handleAddSample}
              className="border border-border bg-card px-4 py-2 label text-primary hover:bg-primary/10 transition-colors"
            >
              + Add Sample Lead
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
            {search ? "No leads matched your search query." : "There are currently no inquiries in this view."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {search && (
              <button onClick={() => setSearch("")} className="border border-border px-4 py-2 label">
                Clear Search Filter
              </button>
            )}
            <button onClick={handleAddSample} className="bg-primary px-5 py-2 label text-primary-foreground">
              Add Sample Inquiry
            </button>
            <button
              onClick={handleRestoreDemoData}
              className="border border-border px-4 py-2 label text-muted-foreground hover:text-foreground"
            >
              Restore Initial Demo Data
            </button>
          </div>
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
            <div className="flex border-b border-border bg-background/20 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setSettingsTab("security")}
                className={`label border-b-2 pb-3 px-3 transition-colors ${
                  settingsTab === "security"
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                🔐 Password &amp; Credentials
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab("data")}
                className={`label border-b-2 pb-3 px-3 transition-colors ${
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
                </div>
              )}

              {/* TAB 2: CLEAR ALL DATA & BACKUP SECTION */}
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

                  {/* Restore sample demo inquiries */}
                  <div className="border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                      <span className="label text-xs text-muted-foreground block">Restore Sample Data</span>
                      <span className="text-xs text-muted-foreground">Load standard template client inquiries for previewing.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestoreDemoData}
                      className="border border-border bg-background px-4 py-2 text-xs font-mono hover:border-primary transition-colors text-foreground"
                    >
                      ↺ Restore Demo Leads
                    </button>
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
