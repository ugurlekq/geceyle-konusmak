// pages/login.tsx
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const mode = router.query.mode === "signup" ? "signup" : "signin";

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center text-white/60">Yükleniyor...</div>;
    }

    // SIGN UP -> under construction
    if (mode === "signup") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">Under construction</h1>
                    <p className="text-sm text-white/70 mb-6">
                        Sign up akışı şu an yapım aşamasında. Şimdilik Google ile giriş açıyoruz.
                    </p>
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

    // SIGN IN
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-black/70 p-6">
                    <h1 className="text-xl text-amber-300 font-semibold mb-3">Geceyle Konuşmak’a Hoş Geldin</h1>
                    <p className="text-sm text-white/70 mb-6">
                        Google ile giriş yaptığında yorum/like’larda ismin görünebilir.
                    </p>

                    <button
                        onClick={() => signIn("google", { callbackUrl: "/profile" })}
                        className="w-full rounded-xl border border-amber-400/70 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 px-4 py-2.5 text-sm transition"
                    >
                        🔐 Google ile Devam Et
                    </button>
                </div>
            </div>
        );
    }

    // Logged in
    return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center">
            <div>
                <h2 className="text-amber-300 text-xl mb-2">Hoş geldin, {session.user?.name || session.user?.email}</h2>
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
