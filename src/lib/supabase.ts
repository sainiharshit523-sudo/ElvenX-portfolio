import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const CONFIG_KEY = "elvenx_supabase_config_v1";

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

  if (typeof window === "undefined") {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SupabaseConfig>;
      return {
        url: (parsed.url || envUrl).trim(),
        anonKey: (parsed.anonKey || envKey).trim(),
      };
    }
  } catch (err) {
    console.debug("Failed to read Supabase config from storage:", err);
  }

  return { url: envUrl.trim(), anonKey: envKey.trim() };
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    cachedClient = null; // Invalidate cached instance
  } catch (err) {
    console.error("Failed to save Supabase config:", err);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = "";
let lastKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  if (cachedClient && url === lastUrl && anonKey === lastKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith("https://"));
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.from("leads").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205" || error.message.includes("relation \"public.leads\" does not exist") || error.code === "42P01") {
        return {
          success: true,
          message: "Connected to Supabase! (Note: 'leads' table not found yet — please run the SQL setup script).",
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: "Successfully connected and verified 'leads' table in Supabase!" };
  } catch (err) {
    return { success: false, message: (err as Error).message || "Connection failed" };
  }
}

export const SUPABASE_LEADS_SQL_SCHEMA = `-- Run this in your Supabase SQL Editor to enable universal lead syncing across mobile and desktop:

CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  services JSONB DEFAULT '[]'::jsonb,
  budget TEXT DEFAULT 'Flexible',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable public read and write so mobile visitors can submit inquiries
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public submissions" 
ON public.leads FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow reading inquiries" 
ON public.leads FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow updating status and notes" 
ON public.leads FOR UPDATE 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow deleting inquiries" 
ON public.leads FOR DELETE 
TO anon, authenticated 
USING (true);

-- Enable real-time broadcast so incoming mobile inquiries alert the portal instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
`;
