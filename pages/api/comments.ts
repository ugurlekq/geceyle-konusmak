// /pages/api/comments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, service, { auth: { persistSession: false } });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const slug = (req.query.slug as string) || req.body?.slug;
        if (!slug || typeof slug !== "string") {
            return res.status(400).json({ ok: false, error: "Missing slug" });
        }

        if (req.method === "GET") {
            const { data, error } = await supabase
                .from("article_comments")
                .select("id, slug, content, created_at, is_hidden")
                .eq("slug", slug)
                .eq("is_hidden", false)
                .order("created_at", { ascending: true }) // ⬅️ DESC değil ASC
                .limit(50);

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, comments: data ?? [] });
        }

        if (req.method === "POST") {
            const content = req.body?.content;
            if (!content || typeof content !== "string" || !content.trim()) {
                return res.status(400).json({ ok: false, error: "Missing content" });
            }

            const { data, error } = await supabase
                .from("article_comments")
                .insert({ slug, content: content.trim(), is_hidden: false })
                .select("id, slug, content, created_at, is_hidden")
                .single();

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, inserted: data });
        }

        return res.status(405).json({ ok: false, error: "Method not allowed" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
}
