import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import fs from "fs";
import path from "path";

type IssueRow = {
    number: number;
    title: string;
    date?: string | null;
    description?: string | null;
    cover_url?: string | null;
    updated_at?: string | null;
};

// ✅ canonical path: content/issues.json (çünkü pages/issues/[id].tsx bunu import ediyor)
function issuesDiskPath() {
    return path.join(process.cwd(), "content", "issues.json");
}

function readIssuesFromDisk(): IssueRow[] {
    const p = issuesDiskPath();
    try {
        if (!fs.existsSync(p)) return [];
        const raw = fs.readFileSync(p, "utf8");
        const j = JSON.parse(raw);
        const items = Array.isArray(j?.items) ? j.items : Array.isArray(j) ? j : [];
        return items
            .map((x: any) => ({
                number: Number(x.number),
                title: String(x.title || ""),
                date: x.date ?? null,
                description: x.description ?? null,
                cover_url: x.coverUrl ?? x.cover_url ?? null,
                updated_at: x.updated_at ?? null,
            }))
            .filter((x: IssueRow) => Number.isFinite(x.number));
    } catch {
        return [];
    }
}

function writeIssuesToDisk(items: IssueRow[]) {
    const p = issuesDiskPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });

    // issues.json'ı array formatında tut (mevcut dosyan da böyle)
    const clean = items
        .map((i) => ({
            number: Number(i.number),
            title: String(i.title || ""),
            date: i.date ?? null,
            description: i.description ?? null,
            cover_url: i.cover_url ?? null,
        }))
        .sort((a, b) => a.number - b.number);

    fs.writeFileSync(p, JSON.stringify(clean, null, 2), "utf8");
}

function mergeIssues(dbItems: IssueRow[], diskItems: IssueRow[]) {
    // Çakışmada DB kazansın (varsa)
    const m = new Map<number, IssueRow>();
    for (const d of diskItems) m.set(d.number, d);
    for (const d of dbItems) m.set(d.number, d);
    return Array.from(m.values()).sort((a, b) => a.number - b.number);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const diskItems = readIssuesFromDisk();

        try {
            const sb = supabaseAdmin();
            const { data, error } = await sb.from("issues").select("*").order("number", { ascending: true });
            if (error) throw error;

            const dbItems: IssueRow[] = (data ?? []) as any;
            return res.status(200).json({ ok: true, items: mergeIssues(dbItems, diskItems) });
        } catch (e: any) {
            // DB yoksa bile diskten dön
            return res.status(200).json({ ok: true, items: diskItems, warn: e?.message || "db_read_failed" });
        }
    }

    // const user = requireAdmin(req, res);
    // if (!user) return;


    if (req.method === "POST") {
        const items = req.body?.items;
        if (!Array.isArray(items)) return res.status(400).json({ ok: false, error: "invalid payload" });

        const incoming: IssueRow[] = items
            .map((i: any) => ({
                number: Number(i.number),
                title: String(i.title || ""),
                date: i.date ?? null,
                description: i.description ?? null,
                cover_url: i.coverUrl ?? i.cover_url ?? null,
                updated_at: new Date().toISOString(),
            }))
            .filter((x: IssueRow) => Number.isFinite(x.number));

        // ✅ disk + incoming merge (incoming kazansın)
        const disk = readIssuesFromDisk();
        const m = new Map<number, IssueRow>();
        for (const d of disk) m.set(d.number, d);
        for (const d of incoming) m.set(d.number, d);
        const merged = Array.from(m.values()).sort((a, b) => a.number - b.number);

        // ✅ 1) disk yaz
        try {
            writeIssuesToDisk(merged);
        } catch (e: any) {
            return res.status(500).json({ ok: false, error: e?.message || "disk_write_error" });
        }

        // ✅ 2) supabase dene (opsiyonel)
        try {
            const sb = supabaseAdmin();
            const payload = merged.map((i) => ({
                number: i.number,
                title: i.title,
                description: i.description ?? null,
                cover_url: i.cover_url ?? null,
                updated_at: i.updated_at ?? new Date().toISOString(),
            }));

            const { error } = await sb.from("issues").upsert(payload, { onConflict: "number" });
            if (error) throw error;

            return res.json({ ok: true, items: merged });
        } catch (e: any) {
            return res.json({ ok: true, items: merged, warn: e?.message || "db_write_failed" });
        }
    }


    if (req.method === "DELETE") {
        const raw = req.query.number;
        const n = Array.isArray(raw) ? parseInt(raw[0] as string, 10) : parseInt((raw as string) || "", 10);
        if (!Number.isFinite(n)) return res.status(400).json({ ok: false, error: "missing or invalid number" });

        // ✅ önce diskten sil
        const diskItems = readIssuesFromDisk().filter((x) => x.number !== n);
        try {
            writeIssuesToDisk(diskItems);
        } catch (e: any) {
            return res.status(500).json({ ok: false, error: e?.message || "disk_delete_error" });
        }

        // ✅ DB varsa silmeyi dene, yoksa warn ile dön
        try {
            const sb = supabaseAdmin();
            const { error } = await sb.from("issues").delete().eq("number", n);
            if (error) throw error;
            return res.json({ ok: true });
        } catch (e: any) {
            return res.json({ ok: true, warn: e?.message || "db_delete_failed" });
        }
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end();
}
