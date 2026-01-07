// components/Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

type IssueLite = { id: string; number: number; title?: string };

// Vercel’de 0 yapınca auth akışını “under construction” moduna alıyoruz.
// Localde .env.local: NEXT_PUBLIC_AUTH_ENABLED=1
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== '0';

export default function Header() {
    const router = useRouter();
    const pathname = router.asPath || '/';

    const { data: session, status } = useSession();
    const user = (session?.user ?? null) as any;

    const [issues, setIssues] = useState<IssueLite[]>([]);
    const [open, setOpen] = useState(false);
    const ddRef = useRef<HTMLDivElement | null>(null);

    function isActive(href: string) {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }

    // ✅ Visit’i şimdilik kapattık. (İstersen prod’da açarız)
    // useEffect(() => {
    //   if (process.env.NODE_ENV !== 'production') return;
    //   fetch('/api/visit', { method: 'POST', credentials: 'include' }).catch(() => {});
    // }, []);

    /* ------------- Sayı listesini API + adminStore’dan çek ------------- */
    useEffect(() => {
        (async () => {
            try {
                // 1) API’den yayınlanmış sayılar
                let apiItems: any[] = [];
                try {
                    const r = await fetch('/api/content/issues', { cache: 'no-store' });
                    const d = await r.json();
                    apiItems = Array.isArray(d?.items) ? (d.items as any[]) : [];
                } catch {
                    apiItems = [];
                }

                const mappedFromApi: IssueLite[] = apiItems.map((it) => ({
                    id: it.id ?? `issue-${it.number}`,
                    number: Number(it.number),
                    title:
                        typeof it.title === 'string' && it.title.trim().length > 0
                            ? it.title.trim()
                            : undefined,
                }));

                // 2) Admin panelden local (henüz publish edilmemiş) sayılar
                let mappedLocal: IssueLite[] = [];
                if (AUTH_ENABLED) {
                    try {
                        const mod = await import('@/lib/adminStore');
                        const raw = (mod.getIssues?.() ?? []) as any[];
                        mappedLocal = raw
                            .map((it): IssueLite => ({
                                id: it.id ?? `local-${it.number}`,
                                number: Number(it.number),
                                title:
                                    typeof it.title === 'string' && it.title.trim().length > 0
                                        ? it.title.trim()
                                        : undefined,
                            }))
                            .filter((i) => !!i.number);
                    } catch {
                        mappedLocal = [];
                    }
                }

                // 3) Sayı 01 garanti
                if (!mappedFromApi.some((i) => i.number === 1)) {
                    mappedFromApi.push({ id: 'issue01', number: 1, title: 'Geceyle Konuşmak' });
                }

                // 4) Tekilleştir + sırala
                const byNumber = new Map<number, IssueLite>();
                for (const it of [...mappedFromApi, ...mappedLocal]) {
                    if (!it.number) continue;
                    if (!byNumber.has(it.number)) byNumber.set(it.number, it);
                }

                setIssues(Array.from(byNumber.values()).sort((a, b) => b.number - a.number));
            } catch {
                setIssues([{ id: 'issue01', number: 1, title: 'Geceyle Konuşmak' }]);
            }
        })();
    }, []);

    /* ------------- Dropdown dışında tıklanınca kapat ------------- */
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!ddRef.current) return;
            if (!ddRef.current.contains(e.target as Node)) setOpen(false);
        }
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    function gotoIssue(number: number) {
        const href = number === 1 ? '/issue01' : `/issues/${String(number).padStart(2, '0')}`;
        setOpen(false);
        router.push(href);
    }

    const profileLabel =
        user?.name || user?.email?.split('@')?.[0] || (status === 'loading' ? '...' : 'Profil');

    // Auth kapalıysa (Vercel): iki buton da aynı login sayfasına gider → orada Under construction görür
    const signinHref = AUTH_ENABLED ? '/login?mode=signin' : '/login?mode=signin';
    const signupHref = AUTH_ENABLED ? '/login?mode=signup' : '/login?mode=signin';

    return (
        <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-40">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
                {/* Sol taraf */}
                <Link href="/" className="flex items-baseline gap-2">
          <span className="text-amber-400 text-xl md:text-2xl font-semibold tracking-wide">
            Geceyle Konuşmak
          </span>
                    <span className="text-xs md:text-sm text-white/50">— Yaşayan Metinler</span>
                </Link>

                {/* Sağ taraf */}
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
                            Sayılar <span className="text-xs opacity-80">▼</span>
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

                                    <Link
                                        href="/issues"
                                        onClick={() => setOpen(false)}
                                        className="block w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                                    >
                                        Tüm sayılar →
                                    </Link>
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

                    {/* AUTH / PROFILE */}
                    {session?.user ? (
                        <Link
                            href="/profile"
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/85 bg-white/5 hover:bg-white/10 transition ${
                                pathname.startsWith('/profile') ? 'bg-white/10' : ''
                            }`}
                            title={user?.email || ''}
                        >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 text-[11px]">
                ●
              </span>
                            <span className="max-w-[140px] truncate">{profileLabel}</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={signinHref}
                                className={`rounded-xl px-3 py-1.5 text-sm border border-white/14 text-white/80 bg-black/30 hover:bg-white/10 transition ${
                                    isActive('/login') ? 'bg-white/10' : ''
                                }`}
                            >
                                Sign in
                            </Link>

                            <Link
                                href={signupHref}
                                className="rounded-xl px-3 py-1.5 text-sm border border-amber-400/60 text-amber-200 bg-black/40 hover:bg-amber-400/10 transition"
                            >
                                Sign up
                            </Link>

                            {!AUTH_ENABLED && (
                                <span className="hidden md:inline text-xs text-white/40">Auth: kapalı</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
