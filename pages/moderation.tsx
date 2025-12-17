// pages/admin/moderation.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Me = { email?: string; role?: 'user' | 'admin' } | null;

type AdminComment = {
    id: string;
    slug: string;
    content: string;
    created_at: string;
    is_hidden?: boolean;
    visitor_id?: string | null;
};

type TopLike = { slug: string; likes: number };

async function safeJson(url: string, fallback: any) {
    try {
        const r = await fetch(url, { cache: 'no-store', credentials: 'include' });
        if (!r.ok) return fallback;
        return await r.json();
    } catch {
        return fallback;
    }
}

async function mustOk(r: Response) {
    let data: any = null;
    try { data = await r.json(); } catch {}
    if (!r.ok) {
        const msg = data?.error || `${r.status} ${r.statusText}`;
        throw new Error(msg);
    }
    return data;
}

export default function AdminModerationPage() {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);

    const [comments, setComments] = useState<AdminComment[]>([]);
    const [topLikes, setTopLikes] = useState<TopLike[]>([]);
    const [visitors, setVisitors] = useState<number | null>(null);

    const [q, setQ] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me', { cache: 'no-store', credentials: 'include' });
                const d = await r.json();
                setMe(d?.email ? d : null);
            } catch {
                setMe(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function refresh() {
        const t = Date.now();
        const c = await safeJson(`/api/admin/comments?limit=200&t=${t}`, { items: [] });
        const l = await safeJson(`/api/admin/likes?top=3&t=${t}`, { items: [] });
        const v = await safeJson(`/api/admin/visitors?t=${t}`, { total: null });


        setComments(Array.isArray(c?.items) ? c.items : []);
        setTopLikes(Array.isArray(l?.items) ? l.items : []);
        setVisitors(typeof v?.total === 'number' ? v.total : null);
    }

    useEffect(() => {
        if (me?.role === 'admin') refresh();
    }, [me?.role]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return comments;
        return comments.filter((x) =>
            (x.slug || '').toLowerCase().includes(s) ||
            (x.content || '').toLowerCase().includes(s)
        );
    }, [comments, q]);

    async function toggleHidden(id: string, nextHidden: boolean) {
        setBusyId(id);
        try {
            const r = await fetch('/api/admin/comments', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_hidden: nextHidden }),
            });

            const j = await r.json().catch(() => null);
            if (!r.ok) {
                alert(j?.error || 'Gizle/Geri aç başarısız');
                return;
            }
            await refresh();
        } finally {
            setBusyId(null);
        }
    }

    async function deleteComment(id: string) {
        const ok = window.confirm('Bu yorumu kalıcı olarak SİLMEK istiyor musun? (Geri dönüş yok)');
        if (!ok) return;

        setBusyId(id);
        try {
            const r = await fetch('/api/admin/comments', {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const j = await r.json().catch(() => null);
            if (!r.ok) {
                alert(j?.error || 'Silme başarısız');
                return;
            }
            await refresh();
        } finally {
            setBusyId(null);
        }
    }


    if (loading) {
        return <div className="min-h-screen bg-black text-white grid place-items-center">Yükleniyor…</div>;
    }

    if (me?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-[420px] text-center">
                    <h1 className="text-amber-300 text-xl mb-2">Yetkisiz Erişim</h1>
                    <p className="text-white/70 mb-4">Bu sayfa sadece admin kullanıcıya açıktır.</p>
                    <Link
                        href="/login"
                        className="inline-block rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/admin"
                    className="rounded-xl px-3.5 py-2 border border-amber-400/50 text-amber-300 bg-black/30 hover:bg-amber-400/15 transition"
                >
                    ← Admin Panel
                </Link>

                <button
                    onClick={refresh}
                    className="rounded-xl px-3.5 py-2 border border-white/14 text-white/75 bg-black/30 hover:bg-white/10 transition"
                >
                    Yenile
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm mb-1">Toplam yorum</div>
                    <div className="text-2xl text-amber-200">{comments.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm mb-1">Toplam ziyaretçi</div>
                    <div className="text-2xl text-amber-200">{visitors ?? '—'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm mb-2">En beğenilen (Top 3)</div>
                    <ol className="space-y-1 text-sm">
                        {topLikes.map((x) => (
                            <li key={x.slug} className="flex justify-between">
                                <span className="text-white/80">{x.slug}</span>
                                <span className="text-amber-200">{x.likes}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="mb-3">
                <input
                    className="w-full md:w-[520px] input"
                    placeholder="Yorumlarda ara (slug / içerik)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-white/80 mb-3">Yorum Moderasyonu</div>

                {filtered.length === 0 ? (
                    <div className="text-white/60">Kayıt yok.</div>
                ) : (
                    <ul className="space-y-2">
                        {filtered.map((c) => (
                            <li key={c.id} className="rounded-xl border border-white/10 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm">
                                        <div className="text-amber-200">{c.slug}</div>
                                        <div className="text-white/50 text-xs">
                                            {new Date(c.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {c.is_hidden ? (
                                            <button
                                                disabled={busyId === c.id}
                                                onClick={() => toggleHidden(c.id, false)}
                                                className="text-xs px-2 py-1 rounded-lg border border-amber-400/30 text-amber-200 hover:bg-amber-400/10 disabled:opacity-50"
                                            >
                                                Geri Aç
                                            </button>
                                        ) : (
                                            <button
                                                disabled={busyId === c.id}
                                                onClick={() => toggleHidden(c.id, true)}
                                                className="text-xs px-2 py-1 rounded-lg border border-red-400/30 text-red-200 hover:bg-red-400/10 disabled:opacity-50"
                                            >
                                                Gizle
                                            </button>
                                        )}

                                        <button
                                            disabled={busyId === c.id}
                                            onClick={() => deleteComment(c.id)}
                                            className="text-xs px-2 py-1 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 disabled:opacity-50"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className={`mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                                        c.is_hidden ? 'text-white/35 line-through' : 'text-white/80'
                                    }`}
                                >
                                    {c.content}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
