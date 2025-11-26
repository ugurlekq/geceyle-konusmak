import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/server/auth';
import { loadIssues, saveIssues } from '@/lib/server/contentStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // --- GET: herkese açık (Header dropdown, yazar sayfaları vs.) ---
    if (req.method === 'GET') {
        try {
            const items = await loadIssues();
            return res.status(200).json({ ok: true, items });
        } catch (e: any) {
            return res
                .status(500)
                .json({ ok: false, error: e?.message || 'read_error' });
        }
    }

    // --- POST + DELETE: sadece admin ---
    const user = requireAdmin(req, res);
    if (!user) return;

    // Tüm listeyi birlikte kaydet (persistIssueToDisk burayı kullanıyor)
    if (req.method === 'POST') {
        const items = req.body?.items;
        if (!Array.isArray(items)) {
            return res
                .status(400)
                .json({ ok: false, error: 'invalid payload' });
        }
        await saveIssues(items);
        return res.json({ ok: true });
    }

    // Tek bir sayıyı numarasına göre sil
    if (req.method === 'DELETE') {
        const raw = req.query.number;
        const n = Array.isArray(raw)
            ? parseInt(raw[0] as string, 10)
            : parseInt((raw as string) || '', 10);

        if (!Number.isFinite(n)) {
            return res
                .status(400)
                .json({ ok: false, error: 'missing or invalid number' });
        }

        try {
            const current = await loadIssues();
            const next = current.filter(
                (i: any) => Number(i.number) !== n
            );
            await saveIssues(next);
            return res.json({ ok: true });
        } catch (e: any) {
            return res
                .status(500)
                .json({ ok: false, error: e?.message || 'delete_error' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end();
}
