// lib/server/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL;

    const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY; // ✅ senin env ismin

    if (!url || !serviceKey) {
        throw new Error('Missing Supabase admin env vars');
    }

    return createClient(url, serviceKey, {
        auth: { persistSession: false },
    });
}
