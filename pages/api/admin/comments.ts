// pages/api/admin/comments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseServer } from "@/lib/supabaseServer";

function isAdminByEnv(email?: string | null) {
    const admin = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    return !!email && !!admin && email.toLowerCase() === admin;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ✅ NextAuth oturumu
    const session = await getServerSession(req, res, authOptions);
    const u = (session?.user as any) || null;

    const email = u?.email as string | undefined;
    const role = u?.role as string | undefined;

    const isAdmin = role === "admin" || isAdminByEnv(email);
    if (!email || !isAdmin) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    if (req.method === "GET") {
        const limit = Math.min(Number(req.query.limit ?? 100) || 100, 300);

        const { data, error } = await supabaseServer
            .from("article_comments")
            .select("id, slug, content, created_at, is_hidden, visitor_id")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) return res.status(500).json({ ok: false, error: error.message });
        return res.status(200).json({ ok: true, items: data ?? [] });
    }

    if (req.method === "PATCH") {
        const { id, is_hidden, content } = req.body ?? {};
        if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

        const patch: any = {};
        if (typeof is_hidden === "boolean") patch.is_hidden = is_hidden;
        if (typeof content === "string") patch.content = content.trim();

        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ ok: false, error: "Nothing to update" });
        }

        const { error } = await supabaseServer
            .from("article_comments")
            .update(patch)
            .eq("id", id);

        if (error) return res.status(500).json({ ok: false, error: error.message });
        return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
}
