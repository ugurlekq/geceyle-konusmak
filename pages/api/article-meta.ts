// /pages/api/article-meta.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, service, { auth: { persistSession: false } });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ ok: false, error: "Method not allowed" });
        }

        const slug = String(req.query.slug || "").trim();
        if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

        // 1) Like count
        const likeQ = supabase
            .from("article_likes")
            .select("id", { count: "exact", head: true })
            .eq("slug", slug);

        // 2) Comment list + count (aynı sorgudan count + data alabiliriz)
        const commentQ = supabase
            .from("article_comments")
            .select("id, slug, content, created_at, is_hidden", { count: "exact" })
            .eq("slug", slug)
            .eq("is_hidden", false)
            .order("created_at", { ascending: false })
            .limit(50);

        const [{ count: likeCount, error: likeErr }, { data: comments, count: commentCount, error: comErr }] =
            await Promise.all([likeQ, commentQ]);

        if (likeErr) return res.status(500).json({ ok: false, error: likeErr.message });
        if (comErr) return res.status(500).json({ ok: false, error: comErr.message });

        return res.status(200).json({
            ok: true,
            slug,
            likeCount: likeCount ?? 0,
            commentCount: commentCount ?? (comments?.length ?? 0),
            comments: comments ?? [],
        });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
}
