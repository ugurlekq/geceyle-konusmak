'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';

// 1) Sunucu tarafı guard: login yoksa /auth'a yönlendir
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const email = ctx.req.cookies?.sa_email;
    if (!email) {
        return {
            redirect: {
                destination: '/auth?next=/subscribe',
                permanent: false,
            },
        };
    }
    return { props: {} };
};

export default function SubscribePage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState<string | null>(null);

    const valid = useMemo(
        () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        [email]
    );

    // Varsa cookie'deki email'i doldur (UI için)
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me');
                const d = await r.json();
                if (d?.email) setEmail(d.email);
            } catch {
                /* yut */
            }
        })();
    }, []);

    async function start() {
        if (!valid) return;
        setLoading(true);
        setError(null);
        try {
            // 1) cookie'ye email yaz (MVP login)
            await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // 2) Stripe Checkout
            const r = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const d = await r.json();
            if (d?.url) {
                window.location.href = d.url;
            } else {
                setError(d?.error || 'Bir hata oluştu');
            }
        } catch (e: any) {
            setError(e?.message || 'Beklenmeyen bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-md mt-16 card">
            <h1 className="text-xl font-semibold text-amber-300">Üyelik — 50 TL/Ay</h1>
            <p className="text-white/70 mt-2">E-postanı yaz; Stripe üzerinden aboneliği başlat.</p>

            <div className="mt-4 space-y-3">
                <input
                    className="input w-full"
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    className={`btn btn-primary ${(!valid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!valid || loading}
                    onClick={start}
                >
                    {loading ? 'Yönlendiriliyor…' : 'Aboneliği Başlat'}
                </button>
                {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            <p className="text-xs text-white/60 mt-3">
                Zaten hesabın var mı? <a href="/auth" className="underline">Giriş yap</a>.
            </p>
        </div>
    );
}
