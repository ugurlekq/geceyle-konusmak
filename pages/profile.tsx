// pages/profile.tsx
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Footer from "@/components/Footer";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className="min-h-screen bg-black text-white grid place-items-center">Yükleniyor…</div>;
    }

    if (!session?.user?.email) {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-[380px] text-center">
                    <h1 className="text-amber-300 text-xl mb-2">Giriş gerekli</h1>
                    <p className="text-white/70 mb-4">Profil sayfasını görmek için giriş yapmalısın.</p>
                    <Link href="/login?mode=signin" className="inline-block rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition">
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    const u: any = session.user;
    const displayName = u.name || u.email.split("@")[0];

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <div className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="rounded-xl px-3.5 py-2 border border-white/14 text-white/80 bg-black/30 hover:bg-white/10 transition">
                            ← Anasayfaya dön
                        </Link>

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="rounded-xl px-3.5 py-2 border border-white/14 text-white/80 bg-white/5 hover:bg-white/10 transition"
                        >
                            Çıkış
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <h1 className="text-2xl text-amber-300 mb-2">{displayName}</h1>

                        <div className="text-white/70">
                            <div className="mb-2">
                                <span className="text-white/50">Email:</span>{" "}
                                <span className="text-white/85">{u.email}</span>
                            </div>

                            <div className="mb-2">
                                <span className="text-white/50">Rol:</span>{" "}
                                <span className="text-white/85">{u.role ?? "user"}</span>
                            </div>
                        </div>

                        {u.role === "admin" && (
                            <div className="mt-4">
                                <Link href="/admin" className="inline-block rounded-xl px-3.5 py-2 border border-amber-400/60 text-amber-200 bg-black/40 hover:bg-amber-400/10 transition">
                                    Admin Paneli
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
