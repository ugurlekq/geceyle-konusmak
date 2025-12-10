// pages/login.tsx
'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
    const { data: session, status } = useSession();

    // Yüklenme durumu
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center text-white/60">
                Yükleniyor...
            </div>
        );
    }

    // Eğer kullanıcı login değilse:
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">
                        Geceyle Konuşmak’a Hoş Geldin
                    </h1>

                    <p className="text-sm text-white/70 mb-6">
                        Google hesabınla giriş yaptığında sana özel içerikleri
                        ve abonelik bilgilerini gösterebileceğiz.
                    </p>

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

    // Eğer giriş yapılmışsa:
    return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center">
            <div>
                <h2 className="text-amber-300 text-xl mb-2">
                    Hoş geldin, {session.user?.name || session.user?.email}
                </h2>

                <p className="text-white/60 mb-6">
                    Artık hesabınla giriş yaptın.
                    Dilersen çıkış yapabilir ya da ana sayfaya dönebilirsin.
                </p>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                >
                    Çıkış Yap
                </button>
            </div>
        </div>
    );
}
