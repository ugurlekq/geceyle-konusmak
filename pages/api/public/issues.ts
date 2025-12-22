import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end();
    }

    try {
        const sb = supabaseAdmin();

        const numberRaw = req.query.number;
        const number = Array.isArray(numberRaw)
            ? parseInt(numberRaw[0] as string, 10)
            : parseInt((numberRaw as string) || "", 10);

        // tekil istenmişse
        if (Number.isFinite(number) && number > 0) {
            const { data, error } = await sb
                .from("issues")
                .select("number,title,description,cover_url,updated_at")
                .eq("number", number)
                .maybeSingle();

            if (error) throw error;

            return res.status(200).json({
                ok: true,
                item: data
                    ? {
                        number: data.number,
                        title: data.title ?? null,
                        description: data.description ?? null,
                        cover_url: data.cover_url ?? null,
                        updated_at: data.updated_at ?? null,
                    }
                    : null,
            });
        }

        // liste istenmişse
        const { data, error } = await sb
            .from("issues")
            .select("number,title,description,cover_url,updated_at")
            .order("number", { ascending: true });

        if (error) throw error;

        return res.status(200).json({ ok: true, items: data ?? [] });
    } catch (e: any) {
        return res.status(200).json({ ok: true, items: [], warn: e?.message || "db_read_failed" });
    }
}
