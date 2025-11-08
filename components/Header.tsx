'use client';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="fixed top-0 inset-x-0 z-[70] border-b border-white/10 bg-black/40 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
                {/* Sol logo/isim */}
                <Link href="/" className="font-semibold text-amber-300 tracking-tight">
                    Geceyle Konuşmak
                </Link>

                {/* Sağ navigasyon (aynı hizada) */}
                <nav className="flex items-center gap-3 text-sm">
                    <Link
                        href="/issue01"
                        className="inline-flex h-8 items-center rounded-lg border border-white/15 bg-white/5 px-3 hover:bg-white/10"
                    >
                        Sayı #1
                    </Link>
                    <Link
                        href="/subscribe"
                        className="inline-flex h-8 items-center rounded-lg border border-amber-400 text-amber-300 px-3 hover:bg-amber-400 hover:text-black transition"
                    >
                        Üyelik
                    </Link>
                </nav>
            </div>
        </header>
    );
}
