// pages/api/admin/comments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabaseServer } from "@/lib/supabaseServer";

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

function readId(req: NextApiRequest) {
    const b = req.body as any;
    const q = req.query as any;
    return (b?.id ?? q?.id) as string | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);
        const email = session?.user?.email || null;

        if (!isAdminEmail(email)) {
            return res.status(401).json({ ok: false, error: "Unauthorized" });
        }

        // GET
        if (req.method === "GET") {
            res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            const limit = Math.min(Number(req.query.limit ?? 100) || 100, 300);

            const { data, error } = await supabaseServer
                .from("article_comments")
                .select("id, slug, content, created_at, is_hidden, visitor_id")
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) return res.status(500).json({ ok: false, error: error.message });
            return res.status(200).json({ ok: true, items: data ?? [] });
        }

        // PATCH (gizle/aç)
        if (req.method === "PATCH") {
            const { id, is_hidden } = (req.body ?? {}) as any;
            if (!id) return res.status(400).json({ ok: false, error: "Missing id" });
            if (typeof is_hidden !== "boolean") {
                return res.status(400).json({ ok: false, error: "Missing is_hidden(boolean)" });
            }

            const { data, error } = await supabaseServer
                .from("article_comments")
                .update({ is_hidden })
                .eq("id", id)
                .select("id, is_hidden");

            if (error) return res.status(500).json({ ok: false, error: error.message });
            if (!data || data.length === 0) {
                // Buraya düşüyorsan: ya id yanlış, ya da RLS/policy/role yüzünden satır “görünmüyor”
                return res.status(404).json({ ok: false, error: "Comment not found / not updated" });
            }

            return res.status(200).json({ ok: true, item: data[0] });
        }

        // DELETE (kalıcı sil)
        if (req.method === "DELETE") {
            const id = readId(req);
            if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

            const { data, error } = await supabaseServer
                .from("article_comments")
                .delete()
                .eq("id", id)
                .select("id");

            if (error) return res.status(500).json({ ok: false, error: error.message });
            if (!data || data.length === 0) {
                return res.status(404).json({ ok: false, error: "Comment not found / not deleted" });
            }

            return res.status(200).json({ ok: true, deletedId: data[0].id });
        }

        res.setHeader("Allow", "GET, PATCH, DELETE");
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || "Server error" });
    }
}
