import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import fs from "fs";
import path from "path";

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

function walkMd(dirAbs: string, baseAbs: string, out: string[]) {
    if (!fs.existsSync(dirAbs)) return;
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dirAbs, e.name);
        if (e.isDirectory()) walkMd(full, baseAbs, out);
        else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
            const rel = path.relative(baseAbs, full).replace(/\\/g, "/");
            const slug = rel.replace(/\.md$/i, "");
            out.push(slug);
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const email = session?.user?.email || null;
    if (!isAdminEmail(email)) return res.status(401).json({ ok: false, error: "Unauthorized" });

    // content/articles altındaki tüm .md -> slug listesi
    const base = path.join(process.cwd(), "content", "articles");
    const slugs: string[] = [];
    walkMd(base, base, slugs);

    // uniq + sort
    const uniq = Array.from(new Set(slugs)).sort();
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ ok: true, items: uniq });
}
