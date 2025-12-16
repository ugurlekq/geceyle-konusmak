// pages/api/comments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer";

function asText(v: unknown) {
    return typeof v === "string" ? v : "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // GET /api/comments?slug=...&limit=50
        if (req.method === "GET") {
            const slug = asText(req.query.slug).trim();
            const limit = Math.min(Math.max(parseInt(asText(req.query.limit) || "50", 10) || 50, 1), 200);

            if (!slug) return res.status(400).json({ ok: false, error: "slug gerekli" });

            const { data, error } = await supabaseServer
                .from("article_comments")
                .select("id, slug, content, created_at, is_hidden, visitor_id")
                .eq("slug", slug)
                .eq("is_hidden", false)
                .order("created_at", { ascending: true }) // UI'da “altta biriksin” istersen ASC iyi
                .limit(limit);

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, items: data ?? [] });
        }

        // POST /api/comments { slug, content }
        if (req.method === "POST") {
            const slug = asText(req.body?.slug).trim();
            const content = asText(req.body?.content).trim();

            if (!slug) return res.status(400).json({ ok: false, error: "slug gerekli" });
            if (!content) return res.status(400).json({ ok: false, error: "yorum boş olamaz" });
            if (slug.length > 180) return res.status(400).json({ ok: false, error: "slug çok uzun" });
            if (content.length > 2000) return res.status(400).json({ ok: false, error: "yorum çok uzun" });

            // visitor_id: sende şu an localStorage var; cookie yoksa null bırak.
            const visitorId = (req.cookies?.visitor_id || null) as string | null;

            const { data, error } = await supabaseServer
                .from("article_comments")
                .insert([{ slug, content, is_hidden: false, visitor_id: visitorId }])
                .select("id, slug, content, created_at, is_hidden, visitor_id")
                .single();

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, item: data });
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || "Server error" });
    }
}
