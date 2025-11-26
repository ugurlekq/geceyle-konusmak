// pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@geceylekonusmak.org';

function makeSessionCookie(email: string, role: 'admin' | 'user') {
    const payload = { email, role };
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json, 'utf8').toString('base64');

    const maxAge = 60 * 60 * 24 * 30; // 30 gün

    return `session=${encodeURIComponent(
        b64
    )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { email } = req.body as { email?: string };

    if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'Email gerekli' });
        return;
    }

    const role: 'admin' | 'user' = email === ADMIN_EMAIL ? 'admin' : 'user';

    const cookie = makeSessionCookie(email, role);
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({ ok: true, email, role });
}
