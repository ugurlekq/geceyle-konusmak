// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secret = process.env.SUPABASE_SECRET_KEY!;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!secret) throw new Error("Missing SUPABASE_SECRET_KEY");

export const supabaseServer = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
});
