// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Bu client SADECE server'da kullanılacak (API route, server actions vs.)
export const supabaseServer = createClient(url, serviceRoleKey, {
    auth: {
        persistSession: false,
    },
});
