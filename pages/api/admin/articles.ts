import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { createClient } from "@supabase/supabase-js";

function isAdminEmail(email?: string | null) {
    if (!email) return false;
    const single = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (single && email.toLowerCase() === single) return true;

    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    return list.includes(email.toLowerCase());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    try {
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SERVICE_KEY =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

        if (!SUPABASE_URL || !SERVICE_KEY) {
            return res.status(500).json({
                ok: false,
                error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env",
            });
        }

        const session = await getServerSession(req, res, authOptions);
        const email = session?.user?.email || null;
        if (!isAdminEmail(email)) {
            return res.status(401).json({ ok: false, error: "Unauthorized" });
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
            auth: { persistSession: false },
        });

        if (req.method === "GET") {
            const { data, error } = await supabaseAdmin
                .from("articles")
                .select("*")
                .order("date", { ascending: false });

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, items: data || [] });
        }

        if (req.method === "POST") {
            const b = req.body || {};

            const row = {
                id: b.id ?? undefined,
                slug: b.slug,
                title: b.title,
                excerpt: b.excerpt ?? "",
                author_id: b.authorId ?? b.author_id ?? null,
                issue_number: Number(b.issueNumber ?? b.issue_number ?? 0) || null,
                date: b.date ?? null,
                embed_url: b.embedUrl ?? b.embed_url ?? "",
                audio_url: b.audioUrl ?? b.audio_url ?? "",
                body: b.body ?? "",
            };

            if (!row.slug || !row.title || !row.issue_number) {
                return res.status(400).json({ ok: false, error: "Missing slug/title/issueNumber" });
            }

            // NOT: onConflict="slug" çalışması için DB'de slug UNIQUE olmalı.
            const { data, error } = await supabaseAdmin
                .from("articles")
                .upsert(row, { onConflict: "slug" })
                .select()
                .single();

            if (error) return res.status(500).json({ ok: false, error: error.message });

            return res.status(200).json({ ok: true, item: data });
        }

        if (req.method === "DELETE") {
            const { id, slug } = req.query as { id?: string; slug?: string };
            if (!id && !slug) return res.status(400).json({ ok: false, error: "Missing id or slug" });

            const q = id
                ? supabaseAdmin.from("articles").delete().eq("id", id)
                : supabaseAdmin.from("articles").delete().eq("slug", slug as string);

            const { error } = await q;
            if (error) return res.status(500).json({ ok: false, error: error.message });

            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ ok: false, error: "Method not allowed" });
    } catch (e: any) {
        return res.status(500).json({
            ok: false,
            error: String(e?.message || e),
            stack: e?.stack || null,
        });
    }
}
