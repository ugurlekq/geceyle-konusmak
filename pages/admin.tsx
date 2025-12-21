// pages/admin.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import type { Issue, Article } from '@/types';
import { getIssues, getArticles, saveIssue, saveArticle, deleteIssue, deleteArticle } from '@/lib/adminStore';
import Footer from '@/components/Footer';
import { authors } from '../data/authors';

type Me = { email?: string; role?: 'user' | 'admin' } | null;

/* -------------------- küçük yardımcılar -------------------- */
async function safeJson<T>(url: string, init?: RequestInit, fallback?: T): Promise<T> {
    try {
        const r = await fetch(url, init);
        const d = await r.json().catch(() => ({} as any));
        return (d ?? fallback) as T;
    } catch {
        return (fallback ?? ({} as any)) as T;
    }
}

function issueNumOf(x: any): number {
    // DB’den snake_case gelebilir: issue_number
    return Number(x?.issueNumber ?? x?.issue_number ?? NaN);
}

/* ------------ Disk yardımcıları (issues + legacy articles 1-2-3) ------------ */
async function persistIssueToDisk(issue: Issue) {
    const d1 = await safeJson<any>('/api/content/issues', { cache: 'no-store', credentials: 'include' }, { items: [] });
    const items: Issue[] = Array.isArray(d1.items) ? d1.items : [];

    const idx = items.findIndex((x) => Number(x.number) === Number(issue.number));
    if (idx >= 0) items[idx] = issue;
    else items.push(issue);

    const d2 = await safeJson<any>('/api/content/issues', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    });

    if (!d2?.ok) console.warn('Sayı kaydı (disk) başarısız:', d2);
}

async function removeIssueFromDisk(number: number) {
    const d = await safeJson<any>(
        '/api/content/issues?number=' + encodeURIComponent(String(number)),
        { method: 'DELETE', credentials: 'include' }
    );
    if (!d?.ok) console.warn('Sayı silme (disk) başarısız:', d);
}

async function loadIssuesFromDiskOrLocal(setIssuesFn: (x: Issue[]) => void) {
    const d = await safeJson<any>('/api/content/issues', { cache: 'no-store', credentials: 'include' }, { items: [] });
    const items: Issue[] = Array.isArray(d.items) ? d.items : [];
    if (items.length > 0) setIssuesFn(items);
    else setIssuesFn(getIssues());
}

async function persistArticleToDisk(a: Article) {
    const payload = {
        id: a.id,
        issueNumber: Number(a.issueNumber),
        title: a.title,
        slug: a.slug,
        authorId: a.authorId,
        date: a.date,
        excerpt: a.excerpt || '',
        embedUrl: a.embedUrl || '',
        audioUrl: (a as any).audioUrl || '',
        body: a.body || '',
    };

    const d = await safeJson<any>('/api/content/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!d?.ok) console.warn('Yazı kaydı (disk) başarısız:', d);
}

async function removeArticleFromDisk(slug: string) {
    const d = await safeJson<any>('/api/content/articles?slug=' + encodeURIComponent(slug), {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!d?.ok) console.warn('Yazı silme (disk) başarısız:', d);
}

/* ------------ DB yardımcıları (articles 4+) ------------ */
async function persistArticleToDb(a: Article) {
    const payload = {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || '',
        authorId: a.authorId,
        issueNumber: Number(a.issueNumber),
        date: a.date,
        embedUrl: a.embedUrl || '',
        audioUrl: (a as any).audioUrl || '',
        body: a.body || '',
    };

    const r = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    const d = await r.json().catch(() => ({} as any));
    if (!r.ok || !d?.ok) {
        alert(`DB yazı kaydı başarısız: ${r.status} ${JSON.stringify(d)}`);
        return false;
    }
    return true;
}

async function removeArticleFromDb(params: { id?: string; slug?: string }) {
    const qs = params.id
        ? `id=${encodeURIComponent(params.id)}`
        : `slug=${encodeURIComponent(params.slug || '')}`;

    const r = await fetch(`/api/admin/articles?${qs}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    const d = await r.json().catch(() => ({} as any));
    if (!r.ok || !d?.ok) {
        alert(`DB yazı silme başarısız: ${r.status} ${JSON.stringify(d)}`);
        return false;
    }
    return true;
}

/* --------------------- Sayfa --------------------- */
export default function AdminPage() {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);

    const [issues, setIssues] = useState<Issue[]>([]);
    const [arts, setArts] = useState<Article[]>([]);
    const [busy, setBusy] = useState(false);

    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    async function refreshArticlesFromDb() {
        const r = await fetch('/api/admin/articles', { cache: 'no-store', credentials: 'include' });
        const d = await r.json().catch(() => ({} as any));
        if (r.ok && d?.ok && Array.isArray(d.items)) return d.items as Article[];
        return null;
    }

    // oturum + listeler
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me', { cache: 'no-store' });
                const d = await r.json().catch(() => ({} as any));
                setMe(d?.email ? d : null);
            } catch {
                setMe(null);
            } finally {
                setLoading(false);
            }
        })();

        (async () => {
            // issues: disk -> local
            await loadIssuesFromDiskOrLocal(setIssues);

            // articles: önce local (legacy)
            const localArts = getArticles();
            setArts(localArts);

            // sonra DB (4+)
            const dbArts = await refreshArticlesFromDb();
            if (dbArts && dbArts.length) {
                // merge: DB baskın (slug/id ile tekilleştir)
                const map = new Map<string, any>();

                for (const a of localArts) {
                    const k = (a.slug || a.id || Math.random().toString(36)) as string;
                    map.set(k, a);
                }
                for (const a of dbArts) {
                    const k = (a.slug || a.id) as string;
                    if (k) map.set(k, a);
                }

                setArts(Array.from(map.values()));
            }
        })();
    }, []);

    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' }).catch(() => {});
        } catch {}
        location.href = '/';
    }

    const sortedIssues = useMemo(() => issues.slice().sort((a, b) => b.number - a.number), [issues]);

    const sortedArts = useMemo(() => {
        return arts
            .slice()
            .sort((a: any, b: any) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime());
    }, [arts]);

    if (loading) {
        return <div className="min-h-screen bg-black text-white grid place-items-center">Yükleniyor…</div>;
    }

    if (me?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-[380px] text-center">
                    <h1 className="text-amber-300 text-xl mb-2">Yetkisiz Erişim</h1>
                    <p className="text-white/70 mb-4">
                        Bu sayfa sadece <span className="text-amber-300">admin</span> kullanıcıya açıktır.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 backdrop-blur-sm hover:bg-amber-400 hover:text-black transition shadow-sm"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <div className="flex-1 p-6">
                {/* Üst bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/"
                        className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 backdrop-blur-sm hover:bg-amber-400 hover:text-black transition shadow-sm"
                    >
                        ← Anasayfaya Dön
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/moderation"
                            className="rounded-xl px-3.5 py-2 border border-amber-400/30 text-amber-200 bg-black/30 backdrop-blur-sm hover:bg-amber-400/15 hover:text-amber-100 transition shadow-sm"
                        >
                            Like / Yorum İşlemleri
                        </Link>

                        <button
                            onClick={logout}
                            className="rounded-xl px-3.5 py-2 border border-white/14 text-white/75 bg-black/30 backdrop-blur-sm hover:bg-white/10 hover:text-white transition shadow-sm"
                        >
                            Çıkış
                        </button>
                    </div>
                </div>

                <h1 className="text-2xl text-amber-300 mb-6">Geceyle Konuşmak — Admin Paneli</h1>

                {/* Issue Form */}
                <IssueForm
                    editing={editingIssue}
                    onCancelEdit={() => setEditingIssue(null)}
                    onSave={async (i) => {
                        try {
                            setBusy(true);

                            // local (fallback)
                            saveIssue(i);

                            // disk
                            await persistIssueToDisk(i);

                            // UI refresh
                            await loadIssuesFromDiskOrLocal(setIssues);

                            setEditingIssue(null);
                        } finally {
                            setBusy(false);
                        }
                    }}
                />

                {/* Article Form */}
                <ArticleForm
                    issues={issues}
                    editing={editingArticle}
                    onCancelEdit={() => setEditingArticle(null)}
                    onSave={async (a) => {
                        try {
                            setBusy(true);
                            a.issueNumber = Number(a.issueNumber);

                            // local fallback listede hemen görünsün
                            saveArticle(a);
                            setArts(getArticles());

                            if (Number(a.issueNumber) >= 4) {
                                const ok = await persistArticleToDb(a);
                                if (ok) {
                                    const dbArts = await refreshArticlesFromDb();
                                    if (dbArts) {
                                        const localArts = getArticles();
                                        const map = new Map<string, any>();
                                        for (const x of localArts) map.set((x.slug || x.id) as string, x);
                                        for (const x of dbArts) map.set((x.slug || x.id) as string, x);
                                        setArts(Array.from(map.values()));
                                    }
                                }
                            } else {
                                await persistArticleToDisk(a);
                            }

                            setEditingArticle(null);
                        } finally {
                            setBusy(false);
                        }
                    }}
                />

                {/* Listeler */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {/* Issues */}
                    <Card title="Sayılar">
                        {sortedIssues.length === 0 ? (
                            <p className="text-white/60">Henüz sayı yok.</p>
                        ) : (
                            <ul className="space-y-2">
                                {sortedIssues.map((i) => {
                                    const hasArticles = arts.some((a: any) => Number(issueNumOf(a)) === Number(i.number));

                                    return (
                                        <li
                                            key={String(i.number)}
                                            className="flex items-center justify-between rounded-lg border border-white/10 p-3 gap-3"
                                        >
                                            <div>
                                                <div className="text-amber-300">
                                                    Sayı {i.number} — {i.title}
                                                </div>
                                                <div className="text-xs text-white/60">{i.date}</div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="text-xs text-amber-200 hover:text-amber-100"
                                                    onClick={() => setEditingIssue(i)}
                                                >
                                                    Düzenle
                                                </button>

                                                <Link
                                                    href={i.number === 1 ? '/issue01' : `/issues/${String(i.number).padStart(2, '0')}`}
                                                    className="text-amber-300 hover:text-amber-200 text-sm"
                                                    target="_blank"
                                                >
                                                    Aç
                                                </Link>

                                                <button
                                                    disabled={busy || hasArticles}
                                                    onClick={async () => {
                                                        if (hasArticles) {
                                                            alert('Bu sayı silinemez çünkü içinde yazı var. Önce bu sayıya ait yazıları silmelisin.');
                                                            return;
                                                        }
                                                        if (!confirm(`Sayı ${i.number} silinsin mi?`)) return;

                                                        try {
                                                            setBusy(true);

                                                            // disk
                                                            await removeIssueFromDisk(i.number);

                                                            // local fallback (temizle)
                                                            deleteIssue(i.number);

                                                            // UI refresh
                                                            await loadIssuesFromDiskOrLocal(setIssues);

                                                            if (editingIssue?.number === i.number) setEditingIssue(null);
                                                        } finally {
                                                            setBusy(false);
                                                        }
                                                    }}
                                                    title={hasArticles ? 'Bu sayıda yazı olduğu için silinemez.' : 'Sayıyı sil'}
                                                    className={[
                                                        'text-sm disabled:opacity-50',
                                                        hasArticles ? 'text-white/30 cursor-not-allowed' : 'text-red-300 hover:text-red-200',
                                                    ].join(' ')}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>

                    {/* Articles */}
                    <Card title="Yazılar">
                        {sortedArts.length === 0 ? (
                            <p className="text-white/60">Henüz yazı yok.</p>
                        ) : (
                            <ul className="space-y-2">
                                {sortedArts.map((a: any) => {
                                    const n = issueNumOf(a);

                                    return (
                                        <li
                                            key={String(a.id || a.slug)}
                                            className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                                        >
                                            <div>
                                                <div className="text-amber-300">{a.title}</div>
                                                <div className="text-xs text-white/60">
                                                    Sayı {n} • {a.authorId ?? a.author_id} • {a.date}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="text-xs text-amber-200 hover:text-amber-100"
                                                    onClick={() =>
                                                        setEditingArticle({
                                                            ...a,
                                                            issueNumber: n,
                                                            authorId: a.authorId ?? a.author_id,
                                                            embedUrl: a.embedUrl ?? a.embed_url,
                                                            audioUrl: a.audioUrl ?? a.audio_url,
                                                        })
                                                    }
                                                >
                                                    Düzenle
                                                </button>

                                                <button
                                                    disabled={busy}
                                                    onClick={async () => {
                                                        if (!confirm(`"${a.title}" yazısı silinsin mi?`)) return;

                                                        try {
                                                            setBusy(true);

                                                            const issueN = Number(n);

                                                            // UI local temizliği
                                                            if (a.id) deleteArticle(a.id);
                                                            setArts((prev) => prev.filter((x: any) => (x.id || x.slug) !== (a.id || a.slug)));

                                                            if (issueN >= 4) {
                                                                // DB delete + refresh
                                                                const ok = await removeArticleFromDb({ id: a.id, slug: a.slug });
                                                                if (ok) {
                                                                    const dbArts = await refreshArticlesFromDb();
                                                                    if (dbArts) {
                                                                        const localArts = getArticles();
                                                                        const map = new Map<string, any>();
                                                                        for (const x of localArts) map.set((x.slug || x.id) as string, x);
                                                                        for (const x of dbArts) map.set((x.slug || x.id) as string, x);
                                                                        setArts(Array.from(map.values()));
                                                                    }
                                                                }
                                                            } else {
                                                                // legacy disk delete
                                                                if (a.slug) await removeArticleFromDisk(a.slug);
                                                            }

                                                            if (editingArticle?.id === a.id) setEditingArticle(null);
                                                        } finally {
                                                            setBusy(false);
                                                        }
                                                    }}
                                                    className="text-red-300 hover:text-red-200 disabled:opacity-50"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}

/* ---------- UI helpers ---------- */
function Card({ title, children }: { title: string; children: any }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-white/80 mb-3">{title}</div>
            {children}
        </div>
    );
}

/* ----------------- IssueForm ----------------- */
function IssueForm({
                       onSave,
                       editing,
                       onCancelEdit,
                   }: {
    onSave: (i: Issue) => void | Promise<void>;
    editing?: Issue | null;
    onCancelEdit?: () => void;
}) {
    const [id, setId] = useState<string | null>(null);
    const [number, setNumber] = useState<number>(2);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    useEffect(() => {
        if (editing) {
            setId(editing.id);
            setNumber(editing.number);
            setTitle(editing.title ?? '');
            setDate(editing.date ?? new Date().toISOString().slice(0, 10));
            setDescription(editing.description ?? '');
            setCoverUrl(editing.coverUrl ?? '');
        } else {
            setId(null);
            setNumber(2);
            setTitle('');
            setDate(new Date().toISOString().slice(0, 10));
            setDescription('');
            setCoverUrl('');
        }
    }, [editing]);

    const isEdit = !!editing;

    return (
        <Card title={isEdit ? 'Sayıyı Düzenle' : 'Yeni Sayı'}>
            <div className="grid md:grid-cols-5 gap-3">
                <input
                    className="md:col-span-1 input"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(parseInt(e.target.value || '0', 10))}
                    placeholder="Sayı No"
                />
                <input className="md:col-span-2 input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
                <input className="md:col-span-2 input" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                <input
                    className="md:col-span-3 input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kısa açıklama"
                />
                <input className="md:col-span-2 input" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Kapak görseli (URL)" />
            </div>

            <div className="mt-3 flex gap-3">
                <button
                    onClick={() =>
                        onSave({
                            id: id ?? (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
                            number: Number(number),
                            title,
                            date,
                            description,
                            coverUrl,
                        } as Issue)
                    }
                    className="btn"
                >
                    {isEdit ? 'Güncelle' : 'Kaydet'}
                </button>

                {isEdit && onCancelEdit && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-4 py-2 rounded-xl border border-white/20 text-sm text-white/70 hover:bg-white/10"
                    >
                        Vazgeç
                    </button>
                )}
            </div>
        </Card>
    );
}

/* ----------------- ArticleForm ----------------- */
function ArticleForm({
                         issues,
                         onSave,
                         editing,
                         onCancelEdit,
                     }: {
    issues: Issue[];
    onSave: (a: Article) => void | Promise<void>;
    editing?: Article | null;
    onCancelEdit?: () => void;
}) {
    const [id, setId] = useState<string | null>(null);
    const [issueNumber, setIssueNumber] = useState<number>(issues[0]?.number ?? 1);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [authorId, setAuthorId] = useState('leon-varis');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [excerpt, setExcerpt] = useState('');
    const [embedUrl, setEmbedUrl] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        if (editing) {
            setId(editing.id);
            setIssueNumber((editing.issueNumber as any) ?? issues[0]?.number ?? 1);
            setTitle(editing.title ?? '');
            setSlug(editing.slug ?? '');
            setAuthorId(editing.authorId ?? 'leon-varis');
            setDate(editing.date ?? new Date().toISOString().slice(0, 10));
            setExcerpt(editing.excerpt ?? '');
            setEmbedUrl((editing as any).embedUrl ?? '');
            setBody(editing.body ?? '');
        } else {
            setId(null);
            setIssueNumber(issues[0]?.number ?? 1);
            setTitle('');
            setSlug('');
            setAuthorId('leon-varis');
            setDate(new Date().toISOString().slice(0, 10));
            setExcerpt('');
            setEmbedUrl('');
            setBody('');
        }
    }, [editing, issues]);

    const isEdit = !!editing;

    return (
        <Card title={isEdit ? 'Yazıyı Düzenle' : 'Yeni Yazı'}>
            <div className="grid md:grid-cols-6 gap-3">
                <select className="md:col-span-1 input" value={issueNumber} onChange={(e) => setIssueNumber(parseInt(e.target.value, 10))}>
                    {issues
                        .slice()
                        .sort((a, b) => b.number - a.number)
                        .map((i) => {
                            const label = i.title ? `Sayı ${i.number} — ${i.title}` : `Sayı ${i.number}`;
                            return (
                                <option key={String(i.number)} value={i.number}>
                                    {label}
                                </option>
                            );
                        })}
                </select>

                <input className="md:col-span-3 input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
                <input className="md:col-span-2 input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (kısa-url)" />

                <select className="md:col-span-2 input" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
                    {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>

                <input className="md:col-span-2 input" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                <input className="md:col-span-2 input" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="YouTube URL (opsiyonel)" />
                <input className="md:col-span-6 input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kısa özet" />
                <textarea className="md:col-span-6 input h-40" value={body} onChange={(e) => setBody(e.target.value)} placeholder="İçerik (opsiyonel)" />
            </div>

            <div className="mt-3 flex gap-3">
                <button
                    onClick={() =>
                        onSave({
                            id: id ?? (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
                            issueNumber: Number(issueNumber),
                            title,
                            slug,
                            authorId,
                            date,
                            excerpt,
                            embedUrl,
                            body,
                        } as Article)
                    }
                    className="btn"
                >
                    {isEdit ? 'Güncelle' : 'Kaydet'}
                </button>

                {isEdit && onCancelEdit && (
                    <button type="button" onClick={onCancelEdit} className="px-4 py-2 rounded-xl border border-white/20 text-sm text-white/70 hover:bg-white/10">
                        Vazgeç
                    </button>
                )}
            </div>
        </Card>
    );
}
