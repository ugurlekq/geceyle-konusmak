// pages/api/admin/visitors.ts
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

    const { count, error } = await supabaseAdmin()
        .from("site_visitors")
        .select("visitor_id", { count: "exact", head: true });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, total: count ?? 0 });
}
