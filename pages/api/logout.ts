// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
    // /api/me'nin kullandığı "session" cookie'sini temizle
    const clearSession =
        'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';

    res.setHeader('Set-Cookie', clearSession);
    return res.status(200).json({ ok: true });
}
