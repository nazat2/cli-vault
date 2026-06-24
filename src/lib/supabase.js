import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// true kalau .env sudah diisi dengan benar
export const supabaseReady = Boolean(url && anonKey);

// Pakai placeholder kalau belum dikonfigurasi, supaya app tetap bisa jalan
// di mode LOCAL tanpa error walau Supabase belum di-setup.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
