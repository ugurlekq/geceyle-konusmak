// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { UserSession } from '@/types';

export default function handler(req: NextApiRequest, res: NextApiResponse<UserSession | { ok: false }>) {
    const raw = req.headers.cookie ? parse(req.headers.cookie) : {};
    const v = raw['gkm_user'];
    if (!v) return res.status(200).json({ ok: false } as any);
    try {
        const data = JSON.parse(v) as UserSession;
        return res.status(200).json(data);
    } catch {
        return res.status(200).json({ ok: false } as any);
    }
}
