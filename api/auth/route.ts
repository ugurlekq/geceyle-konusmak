// pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { UserSession } from '@/types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@geceylekonusmak.org';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: 'email required' });

    const role: UserSession['role'] = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    const value: UserSession = { email, role };

    res.setHeader(
        'Set-Cookie',
        serialize('gkm_user', JSON.stringify(value), {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 gün
        })
    );
    res.status(200).json(value);
}
