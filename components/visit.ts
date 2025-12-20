// pages/api/visit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const visitorId = (req.body?.visitorId || "").toString().trim();
    if (!visitorId) return res.status(400).json({ ok: false, error: "Missing visitorId" });

    // upsert + view increment
    const { data: existing } = await supabaseAdmin()
        .from("site_visitors")
        .select("visitor_id, views")
        .eq("visitor_id", visitorId)
        .maybeSingle();

    if (!existing) {
        const { error } = await supabaseAdmin()
            .from("site_visitors")
            .insert({ visitor_id: visitorId, views: 1 });

        if (error) return res.status(500).json({ ok: false, error: error.message });
        return res.status(200).json({ ok: true, isNew: true });
    }

    const { error } = await supabaseAdmin()
        .from("site_visitors")
        .update({ last_seen: new Date().toISOString(), views: (existing.views || 0) + 1 })
        .eq("visitor_id", visitorId);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, isNew: false });
}
