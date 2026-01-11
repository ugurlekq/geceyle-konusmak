// pages/under-construction.tsx
'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function UnderConstruction() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />

            <main className="mx-auto max-w-3xl px-6 pt-20 pb-24">
                <h1 className="text-3xl font-semibold text-amber-300">Under Construction</h1>
                <p className="mt-4 text-white/70 leading-relaxed">
                    Giriş sistemi şu an sadece local geliştirme ortamında açık.
                    Canlı sitede (prod) bu bölüm geçici olarak kapalı.
                </p>

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/"
                        className="rounded-xl px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 transition"
                    >
                        Ana sayfa
                    </Link>
                    <Link
                        href="/issues"
                        className="rounded-xl px-4 py-2 border border-amber-400/50 text-amber-200 bg-black/40 hover:bg-amber-400/10 transition"
                    >
                        Sayılar
                    </Link>
                </div>
            </main>
        </div>
    );
}
