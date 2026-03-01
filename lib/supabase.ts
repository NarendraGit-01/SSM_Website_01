import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isPlaceholder = (val: string) => !val || val.includes("YOUR_") || val === "fallback";

const supabaseUrl = isPlaceholder(rawUrl) ? "https://fallback.supabase.co" : rawUrl;
const supabaseKey = isPlaceholder(rawKey) ? "fallback" : rawKey;

// Initialize a generic client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is actually configured
export const isSupabaseConfigured = () => {
    return !isPlaceholder(rawUrl) && !isPlaceholder(rawKey);
};
