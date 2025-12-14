// /pages/api/likes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { getClientIp, rateLimit, setRateHeaders } from "@/lib/ratelimit";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, service, { auth: { persistSession: false } });

function parseCookies(req: NextApiRequest) {
    const raw = req.headers.cookie || "";
    const out: Record<string, string> = {};
    raw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((pair) => {
            const idx = pair.indexOf("=");
            if (idx === -1) return;
            const k = decodeURIComponent(pair.slice(0, idx));
            const v = decodeURIComponent(pair.slice(idx + 1));
            out[k] = v;
        });
    return out;
}

function setCookie(res: NextApiResponse, name: string, value: string) {
    // Not: Dev için Secure yok. Prod HTTPS’te Secure eklenebilir.
    const cookie = `${name}=${encodeURIComponent(
        value
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;

    const prev = res.getHeader("Set-Cookie");
    if (!prev) {
        res.setHeader("Set-Cookie", cookie);
    } else if (Array.isArray(prev)) {
        res.setHeader("Set-Cookie", [...prev, cookie]);
    } else {
        res.setHeader("Set-Cookie", [String(prev), cookie]);
    }
}

function newVisitorId() {
    return crypto.randomUUID?.() ?? crypto.randomBytes(16).toString("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const slug = (req.query.slug as string) || req.body?.slug;
        if (!slug || typeof slug !== "string") {
            return res.status(400).json({ ok: false, error: "Missing slug" });
        }

        // IP (rate limit için)
        const ip = getClientIp(req);

        if (req.method === "GET") {
            const { count, error } = await supabase
                .from("article_likes")
                .select("id", { count: "exact", head: true })
                .eq("slug", slug);

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, slug, count: count ?? 0 });
        }

        if (req.method === "POST") {
            // 🔒 RATE LIMIT — like için
            const rl = rateLimit(`like:${ip}:${slug}`, 6, 60 * 1000); // 1 dakikada max 6 deneme
            setRateHeaders(res, rl);
            if (!rl.ok) {
                return res
                    .status(429)
                    .json({ ok: false, error: "Beğenileri biraz yavaş basalım 🙂" });
            }

            // ✅ visitor_id cookie (login yokken tekil like)
            const cookies = parseCookies(req);
            let vid = cookies["vid"];
            if (!vid) {
                vid = newVisitorId();
                setCookie(res, "vid", vid);
            }

            // insert: aynı slug+visitor ikinci kez olamaz (unique index ile)
            const { error: insErr } = await supabase
                .from("article_likes")
                .insert({ slug, visitor_id: vid });

            // sadece unique çakışması alreadyLiked say
            const isDuplicate =
                (insErr as any)?.code === "23505" ||
                (((insErr as any)?.message || "").toLowerCase().includes("duplicate")) ||
                (((insErr as any)?.message || "").includes("article_likes_slug_visitor_unique"));

            // unique dışı hata => gerçekten hata verelim (saklamayalım)
            if (insErr && !isDuplicate) {
                return res.status(500).json({
                    ok: false,
                    error: (insErr as any).message || "Like insert failed",
                });
            }

            // ✅ her durumda güncel count dön
            const { count, error: cntErr } = await supabase
                .from("article_likes")
                .select("id", { count: "exact", head: true })
                .eq("slug", slug);

            if (cntErr) {
                return res.status(500).json({ ok: false, error: cntErr.message });
            }

            return res.status(200).json({
                ok: true,
                slug,
                count: count ?? 0,
                alreadyLiked: isDuplicate,
            });
        }

        return res.status(405).json({ ok: false, error: "Method not allowed" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
}
