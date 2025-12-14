// /lib/ratelimit.ts
type Bucket = { count: number; resetAt: number };

const mem = new Map<string, Bucket>();

export function getClientIp(req: any) {
    const xf = req.headers["x-forwarded-for"];
    const ip =
        (Array.isArray(xf) ? xf[0] : xf)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown";
    return ip;
}

/**
 * Sliding-ish window (simple fixed window)
 * @returns { ok, remaining, resetMs }
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const b = mem.get(key);

    if (!b || now > b.resetAt) {
        mem.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, remaining: limit - 1, resetMs: windowMs };
    }

    if (b.count >= limit) {
        return { ok: false, remaining: 0, resetMs: b.resetAt - now };
    }

    b.count += 1;
    mem.set(key, b);
    return { ok: true, remaining: limit - b.count, resetMs: b.resetAt - now };
}

export function setRateHeaders(res: any, info: { remaining: number; resetMs: number }) {
    res.setHeader("X-RateLimit-Remaining", String(info.remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(info.resetMs / 1000)));
}
