// pages/api/visit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        const visitorId = String(req.body?.visitorId || "").trim();
        if (!visitorId) return res.status(400).json({ ok: false, error: "Missing visitorId" });

        const sb = supabaseAdmin();

        const { data: existing, error: selectError } = await sb
            .from("site_visitors")
            .select("visitor_id, views")
            .eq("visitor_id", visitorId)
            .maybeSingle();

        if (selectError) {
            return res.status(500).json({ ok: false, error: selectError.message });
        }

        const now = new Date().toISOString();

        if (!existing) {
            const { error: insertError } = await sb
                .from("site_visitors")
                .insert({ visitor_id: visitorId, views: 1, last_seen: now });

            if (insertError) return res.status(500).json({ ok: false, error: insertError.message });
            return res.status(200).json({ ok: true, isNew: true });
        }

        const nextViews = (Number(existing.views) || 0) + 1;

        const { error: updateError } = await sb
            .from("site_visitors")
            .update({ last_seen: now, views: nextViews })
            .eq("visitor_id", visitorId);

        if (updateError) return res.status(500).json({ ok: false, error: updateError.message });

        return res.status(200).json({ ok: true, isNew: false });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e?.message || "visit_error" });
    }
}
