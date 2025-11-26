// components/Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UserSession } from '@/types';

type IssueLite = { id: string; number: number; title?: string };

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState<UserSession | null>(null);
    const [issues, setIssues] = useState<IssueLite[]>([]);
    const [open, setOpen] = useState(false);
    const ddRef = useRef<HTMLDivElement | null>(null);

    function isActive(href: string) {
        if (!pathname) return false;
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }

    // Kullanıcı oturumunu oku
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me', { cache: 'no-store' });
                const d = await r.json();
                setUser(d?.email ? (d as UserSession) : null);
            } catch {
                setUser(null);
            }
        })();
    }, []);

    // Sayı listesini API’den çek
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/content/issues', { cache: 'no-store' });
                const d = await r.json();
                const rawItems = Array.isArray(d?.items) ? d.items as any[] : [];

                let mapped: IssueLite[] = rawItems.map((it) => ({
                    id: it.id ?? `issue-${it.number}`,
                    number: Number(it.number),
                    title: it.title as string | undefined,
                }));

                // 🔹 Eski statik Sayı 01 yoksa mutlaka ekle
                if (!mapped.some((i) => i.number === 1)) {
                    mapped.push({
                        id: 'issue01',
                        number: 1,
                        title: 'Geceyle Konuşmak',
                    });
                }

                // büyükten küçüğe sırala (son sayı en üstte olsun)
                mapped = mapped.sort((a, b) => b.number - a.number);

                setIssues(mapped);
            } catch {
                // API tamamen patlarsa en azından Sayı 01’i göster
                setIssues([
                    { id: 'issue01', number: 1, title: 'Geceyle Konuşmak' },
                ]);
            }
        })();
    }, []);

    // Dropdown dışında tıklanınca kapat
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!ddRef.current) return;
            if (!ddRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    function gotoIssue(number: number) {
        const href = number === 1
            ? '/issue01'
            : `/issues/${String(number).padStart(2, '0')}`;

        setOpen(false);
        router.push(href);
    }

    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' }).catch(() => {});
        } catch {}
        router.push('/');
        router.refresh();
    }

    return (
        <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-40">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
                {/* Sol taraf: logo / başlık */}
                <Link href="/" className="flex items-baseline gap-2">
                    <span className="text-amber-400 text-xl md:text-2xl font-semibold tracking-wide">
                        Geceyle Konuşmak
                    </span>
                    <span className="text-xs md:text-sm text-white/50">
                        — Yaşayan Metinler
                    </span>
                </Link>

                {/* Sağ taraf: sayı seçici + linkler */}
                <div className="flex items-center gap-3">

                    {/* Sayı dropdown */}
                    <div className="relative" ref={ddRef}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen((o) => !o);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-400/60 px-3 py-1.5 text-sm text-amber-200 bg-black/40 hover:bg-amber-400/10 transition"
                        >
                            Sayılar
                            <span className="text-xs opacity-80">▼</span>
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/95 shadow-xl overflow-hidden">
                                <div className="max-h-80 overflow-y-auto py-1">
                                    {issues.map((i) => {
                                        const label = i.title
                                            ? `Sayı ${String(i.number).padStart(2, '0')} — ${i.title}`
                                            : `Sayı ${String(i.number).padStart(2, '0')}`;

                                        return (
                                            <button
                                                key={i.id}
                                                type="button"
                                                onClick={() => gotoIssue(i.number)}
                                                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {user?.role === 'admin' && (
                                    <div className="border-t border-white/10">
                                        <Link
                                            href="/admin"
                                            className="block px-3 py-2 text-xs text-amber-300 hover:bg-amber-400/10"
                                        >
                                            Admin Paneli
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/authors/leon-varis"
                        className={`rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/80 bg-black/30 hover:bg-white/10 transition ${
                            isActive('/authors/leon-varis') ? 'bg-white/10' : ''
                        }`}
                    >
                        Yazarlar
                    </Link>
                    
                    <Link
                        href="/subscribe"
                        className={`rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/80 bg-black/30 hover:bg-white/10 transition ${
                            isActive('/subscribe') ? 'bg-white/10' : ''
                        }`}
                    >
                        Abone Ol
                    </Link>

                    {user ? (
                        <>
                            {/* E-posta’yı kaldırdık */}
                            <button
                                onClick={logout}
                                className="rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/80 bg-white/5 hover:bg-white/10 transition"
                            >
                                Çıkış
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className={`rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/80 bg-black/30 hover:bg-white/10 transition ${
                                isActive('/login') ? 'bg-white/10' : ''
                            }`}
                        >
                            Giriş
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
