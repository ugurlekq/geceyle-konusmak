// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const raw = req.headers.cookie || '';
    const match = raw.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
    if (!match) {
        res.status(200).json({});
        return;
    }
    try {
        const val = decodeURIComponent(match.split('=')[1] || '');
        const json = JSON.parse(Buffer.from(val, 'base64').toString('utf8'));
        // güvenlik: sadece email ve role dönüyoruz
        res.status(200).json({ email: json.email, role: json.role });
    } catch {
        res.status(200).json({});
    }
}
