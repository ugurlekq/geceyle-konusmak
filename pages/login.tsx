// pages/login.tsx
'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo } from "react";

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // mode & error parametrelerini güvenli oku
    const mode = useMemo(() => {
        const m = router.query.mode;
        return m === "signup" ? "signup" : "signin";
    }, [router.query.mode]);

    const err = useMemo(() => {
        const e = router.query.error;
        return typeof e === "string" ? e : null;
    }, [router.query.error]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center text-white/60">
                Yükleniyor...
            </div>
        );
    }

    // Giriş yaptıysa profile’a (veya /)
    if (session) {
        router.replace("/profile");
        return (
            <div className="min-h-screen flex items-center justify-center text-white/60">
                Yönlendiriliyor...
            </div>
        );
    }

    // ✅ SIGN UP -> under construction
    if (mode === "signup") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">Under construction</h1>
                    <p className="text-sm text-white/70 mb-6">
                        Sign up akışı şu an yapım aşamasında. Şimdilik Google ile giriş açıyoruz.
                    </p>

                    {err && (
                        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            Giriş hatası: {err}
                        </div>
                    )}

                    <button
                        onClick={() => router.push("/login?mode=signin")}
                        className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm transition"
                    >
                        Sign in sayfasına dön
                    </button>
                </div>
            </div>
        );
    }

    // ✅ SIGN IN ekranı (Google ile devam)
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                <h1 className="text-xl text-amber-300 font-semibold mb-3">
                    Geceyle Konuşmak’a Hoş Geldin
                </h1>

                <p className="text-sm text-white/70 mb-6">
                    Google hesabınla giriş yaptığında sana özel içerikleri ve profilini gösterebileceğiz.
                </p>

                {err && (
                    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        Giriş hatası: {err}
                    </div>
                )}

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition"
                >
                    🔐 Google ile Devam Et
                </button>
            </div>
        </div>
    );
}
