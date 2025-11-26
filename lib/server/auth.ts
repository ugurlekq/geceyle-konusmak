// lib/server/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse as parseCookie, serialize } from 'cookie';

export const SESSION_EMAIL = 'gk_email';
export const SESSION_ROLE  = 'gk_role';
export const ADMIN_EMAIL =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@geceylekonusmak.org';

export type ServerUser = { email: string; role: 'user'|'admin' } | null;

// ---- cookie helpers
export function readUserFromRequest(req: NextApiRequest): ServerUser {
    const raw = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
    const c = parseCookie(raw || '');
    const email = c[SESSION_EMAIL] || null;
    const role = (c[SESSION_ROLE] as 'user'|'admin') ||
        (email === ADMIN_EMAIL ? 'admin' : 'user');
    if (!email) return null;
    return { email, role };
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
    const u = readUserFromRequest(req);
    if (!u || u.role !== 'admin') {
        res.status(401).json({ ok:false, error:'unauthorized' });
        return null;
    }
    return u;
}

// ---- cookie writers (auth/logout’ta kullanacağız)
export function cookieSet(name: string, value: string) {
    return serialize(name, value, {
        path: '/',
        httpOnly: true,   // JS erişmesin; güvenli
        sameSite: 'lax',
        // dev ortamında secure:false kalabilir; prod’da true önerilir
        secure: false,
        maxAge: 60 * 60 * 24 * 30, // 30 gün
    });
}
export function cookieClear(name: string) {
    return serialize(name, '', { path:'/', httpOnly:true, sameSite:'lax', secure:false, maxAge:0 });
}
