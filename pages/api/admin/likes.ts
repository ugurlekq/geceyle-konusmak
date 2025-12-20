// pages/api/admin/likes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

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
    const session = await getServerSession(req, res, authOptions);
    const email = session?.user?.email || null;

    if (!isAdminEmail(email)) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const top = Math.min(Number(req.query.top ?? 3) || 3, 20);

    const { data, error } = await supabaseAdmin()
        .from("article_likes")
        .select("slug")
        .order("created_at", { ascending: false }); // sadece veri çekmek için; aşağıda aggregate edeceğiz

    if (error) return res.status(500).json({ ok: false, error: error.message });

    // basit aggregate (küçük site => yeterli)
    const map = new Map<string, number>();
    for (const row of data ?? []) {
        const slug = (row as any).slug as string;
        map.set(slug, (map.get(slug) || 0) + 1);
    }

    const items = Array.from(map.entries())
        .map(([slug, likes]) => ({ slug, likes }))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, top);

    return res.status(200).json({ ok: true, items });
}
