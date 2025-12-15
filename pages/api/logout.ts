// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function clearCookie(name: string, req: NextApiRequest) {
    const isHttps =
        req.headers['x-forwarded-proto'] === 'https' ||
        (req.headers.referer?.startsWith('https://') ?? false);

    // prod'da https varsa Secure kullan
    const secure = isHttps ? '; Secure' : '';

    return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // NextAuth + eski "session" cookie (sizde kalmış olabilir) hepsini temizle
    const cookies = [
        clearCookie('session', req),

        // NextAuth (dev)
        clearCookie('next-auth.session-token', req),
        clearCookie('next-auth.csrf-token', req),
        clearCookie('next-auth.callback-url', req),

        // NextAuth (prod/secure varyantları)
        clearCookie('__Secure-next-auth.session-token', req),
        clearCookie('__Host-next-auth.csrf-token', req),
    ];

    res.setHeader('Set-Cookie', cookies);
    return res.status(200).json({ ok: true });
}
