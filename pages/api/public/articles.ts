import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
        return res.status(500).json({ ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" });
    }

    const sb = createClient(url, anon, { auth: { persistSession: false } });

    const issueNumber = Number(req.query.issueNumber || 0) || null;

    let q = sb
        .from("articles")
        .select("slug,title,excerpt,author_id,issue_number,date,embed_url,audio_url,updated_at")
        .order("date", { ascending: false });

    if (issueNumber) q = q.eq("issue_number", issueNumber);

    const { data, error } = await q;
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, items: data || [] });
}
