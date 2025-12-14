import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const adminSecret = req.headers["x-admin-secret"];

    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { commentId, action } = req.body;

    if (!commentId || !["hide", "show"].includes(action)) {
        return res.status(400).json({ ok: false, error: "Invalid request" });
    }

    const { error } = await supabase
        .from("article_comments")
        .update({ is_hidden: action === "hide" })
        .eq("id", commentId);

    if (error) {
        return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true });
}
