// pages/login.tsx
'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== '0';
const IS_LOCAL =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// AUTH_ENABLED env’i koru ama localde daima true say
const AUTH_OK = IS_LOCAL ? true : AUTH_ENABLED;


export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const modeRaw = router.query.mode;
    const mode = typeof modeRaw === 'string' ? modeRaw : 'signin';

    const errRaw = router.query.error;
    const err = typeof errRaw === 'string' ? errRaw : '';

    // Login olmuşsa profile'a at
    if (status !== 'loading' && session?.user) {
        if (typeof window !== 'undefined') window.location.assign('/profile');
        return null;
    }

    // PROD/Vercel'de auth kapalı: signin + signup aynı şekilde under construction
    if (!AUTH_OK)
        {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">Under construction</h1>
                    <p className="text-sm text-white/70 mb-6">
                        Giriş/Kayıt akışı production’da şimdilik kapalı.
                        Local’de admin işlemleri için açık.
                    </p>

                    {err && (
                        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            Hata: {err}
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm transition"
                    >
                        Anasayfaya dön
                    </button>
                </div>
            </div>
        );
    }

    // Local'de signup yine kapalı (senin istediğin gibi)
    if (mode === 'signup') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">Under construction</h1>
                    <p className="text-sm text-white/70 mb-6">
                        Sign up akışı şu an yapım aşamasında. Şimdilik Google ile giriş açıyoruz.
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm transition"
                    >
                        Anasayfaya dön
                    </button>

                    <button
                        onClick={() => router.push('/login?mode=signin')}
                        className="mt-3 w-full rounded-xl border border-white/14 bg-black/40 hover:bg-white/10 text-white/80 px-4 py-2.5 text-sm transition"
                    >
                        Sign in sayfasına git
                    </button>
                </div>
            </div>
        );
    }

    // Local signin: Google ile devam
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center text-white/60">
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                <h1 className="text-xl text-amber-300 font-semibold mb-3">Geceyle Konuşmak’a Hoş Geldin</h1>

                <p className="text-sm text-white/70 mb-6">
                    Google hesabınla giriş yaptığında sana özel içerikleri ve profilini gösterebileceğiz.
                </p>

                {err && (
                    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        Giriş hatası: {err}
                    </div>
                )}

                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition"
                >
                    🔐 Google ile Devam Et
                </button>
            </div>
        </div>
    );
}
