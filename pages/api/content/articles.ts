import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

// ✅ Disk CMS okuyucu (sizde bu zaten var)
import { getAllArticleMeta, getArticle } from "@/lib/cms";

type DbArticleLite = {
    slug: string;
    title: string;
    excerpt?: string | null;
    author_id?: string | null;
    issue_number?: number | null;
    date?: string | null;
    embed_url?: string | null;
    audio_url?: string | null;
    updated_at?: string | null;
};

function normalizeDiskMeta(m: any) {
    return {
        slug: String(m.slug),
        title: String(m.title || ""),
        excerpt: m.excerpt ?? null,
        author_id: m.authorId ?? null,
        issue_number: m.issueNumber ?? null,
        date: m.date ?? null,
        embed_url: m.embedUrl ?? null,
        audio_url: m.audioUrl ?? null,
        updated_at: null,
        _source: "disk" as const,
    };
}

function normalizeDbMeta(m: any) {
    return {
        slug: String(m.slug),
        title: String(m.title || ""),
        excerpt: m.excerpt ?? null,
        author_id: m.author_id ?? null,
        issue_number: m.issue_number ?? null,
        date: m.date ?? null,
        embed_url: m.embed_url ?? null,
        audio_url: m.audio_url ?? null,
        updated_at: m.updated_at ?? null,
        _source: "db" as const,
    };
}

function mergeBySlug(dbItems: any[], diskItems: any[]) {
    // Çakışmada DB kazansın
    const m = new Map<string, any>();
    for (const d of diskItems) m.set(d.slug, d);
    for (const d of dbItems) m.set(d.slug, d);

    // Sıralama: updated_at varsa ona göre, yoksa date
    const arr = Array.from(m.values());
    arr.sort((a, b) => {
        const ta = a.updated_at ? Date.parse(a.updated_at) : (a.date ? Date.parse(a.date) : 0);
        const tb = b.updated_at ? Date.parse(b.updated_at) : (b.date ? Date.parse(b.date) : 0);
        return tb - ta;
    });
    return arr;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET: liste + tekil body
    if (req.method === "GET") {
        try {
            const sb = supabaseAdmin();
            const { slug } = req.query as { slug?: string };

            // Tekil: önce DB, yoksa disk
            if (slug) {
                const { data, error } = await sb.from("articles").select("*").eq("slug", slug).maybeSingle();
                if (error) throw error;

                if (data) return res.status(200).json({ ok: true, item: data, source: "db" });

                // DB’de yoksa disk’ten oku
                try {
                    const a = getArticle(String(slug));
                    // Admin editörü için body(markdown) yok → ama en azından içerik görünsün diye html veriyoruz
                    return res.status(200).json({
                        ok: true,
                        item: {
                            slug: a.slug,
                            title: a.title,
                            excerpt: a.excerpt ?? null,
                            author_id: a.authorId ?? null,
                            issue_number: a.issueNumber ?? null,
                            date: a.date ?? null,
                            embed_url: a.embedUrl ?? null,
                            audio_url: a.audioUrl ?? null,
                            body: "",       // diskten md path çözmeden body veremiyoruz
                            html: a.html,   // ✅ okunabilir içerik
                        },
                        source: "disk",
                    });
                } catch {
                    return res.status(200).json({ ok: true, item: null });
                }
            }

            // Liste: DB + Disk meta merge
            const { data, error } = await sb
                .from("articles")
                .select("slug,title,excerpt,author_id,issue_number,date,embed_url,audio_url,updated_at")
                .order("updated_at", { ascending: false });

            if (error) throw error;

            const dbItems = (data ?? []).map(normalizeDbMeta);

            const diskMeta = getAllArticleMeta().map((m) => normalizeDiskMeta(m));

            const merged = mergeBySlug(dbItems, diskMeta);

            return res.status(200).json({ ok: true, items: merged });
        } catch (e: any) {
            // DB patlarsa bile disk meta’yı döndür
            const diskMeta = getAllArticleMeta().map((m) => normalizeDiskMeta(m));
            return res.status(200).json({ ok: true, items: diskMeta, warn: e?.message || "db_read_failed" });
        }
    }

    const user = requireAdmin(req, res);
    if (!user) return;

    if (req.method === "POST") {
        try {
            const a = req.body || {};
            if (!a.slug || !a.title) return res.status(400).json({ ok: false, error: "missing slug/title" });

            const sb = supabaseAdmin();
            const payload = {
                slug: String(a.slug),
                title: String(a.title),
                excerpt: a.excerpt ? String(a.excerpt) : null,
                author_id: a.authorId ? String(a.authorId) : null,
                issue_number: a.issueNumber != null ? Number(a.issueNumber) : null,
                date: a.date ? String(a.date) : null,
                embed_url: a.embedUrl ? String(a.embedUrl) : null,
                audio_url: a.audioUrl ? String(a.audioUrl) : null,
                body: a.body ? String(a.body) : "",
                updated_at: new Date().toISOString(),
            };

            const { error } = await sb.from("articles").upsert(payload, { onConflict: "slug" });
            if (error) throw error;

            return res.json({ ok: true });
        } catch (e: any) {
            return res.status(500).json({ ok: false, error: e?.message || "write_error" });
        }
    }

    if (req.method === "DELETE") {
        try {
            const slug = String((req.query as any).slug || "");
            if (!slug) return res.status(400).json({ ok: false, error: "missing slug" });

            const sb = supabaseAdmin();
            const { error } = await sb.from("articles").delete().eq("slug", slug);
            if (error) throw error;

            return res.json({ ok: true });
        } catch (e: any) {
            return res.status(500).json({ ok: false, error: e?.message || "delete_error" });
        }
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end();
}
