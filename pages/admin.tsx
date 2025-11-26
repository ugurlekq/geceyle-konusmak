// pages/admin.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import type { Issue, Article } from '@/types';
import {
    getIssues,
    getArticles,
    saveIssue,
    saveArticle,
    deleteIssue,
    deleteArticle,
} from '@/lib/adminStore';
import Footer from '@/components/Footer';
import { authors } from '../data/authors';

type Me = { email?: string; role?: 'user' | 'admin' } | null;

/* ------------ API yardımcıları (disk kalıcılığı) ------------ */
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

    try {
        const r = await fetch('/api/content/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const d = await r.json().catch(() => ({} as any));
        if (!r.ok || !d?.ok) {
            console.warn('Yazı kaydı API başarısız:', r.status, d);
        }
    } catch (err) {
        console.warn('Yazı kaydı sırasında hata:', err);
    }
}

async function removeArticleFromDisk(slug: string) {
    try {
        const r = await fetch(
            '/api/content/articles?slug=' + encodeURIComponent(slug),
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );
        const d = await r.json().catch(() => ({} as any));
        if (!r.ok || !d?.ok) {
            console.warn('Yazı silme API başarısız:', r.status, d);
        }
    } catch (err) {
        console.warn('Yazı silme sırasında hata:', err);
    }
}

async function persistIssueToDisk(issue: Issue) {
    try {
        // 1) Mevcut sayıları oku
        const r1 = await fetch('/api/content/issues', { cache: 'no-store' });
        const d1 = await r1.json().catch(() => ({} as any));
        const items: Issue[] = Array.isArray(d1.items) ? d1.items : [];

        // 2) Yeni/var olan sayıyı ekle/güncelle
        const idx = items.findIndex((x: Issue) => x.number === issue.number);
        if (idx >= 0) items[idx] = issue;
        else items.push(issue);

        // 3) API’nin beklediği formatla kaydet
        const payload = { items };

        const r2 = await fetch('/api/content/issues', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const d2 = await r2.json().catch(() => ({} as any));
        if (!r2.ok || !d2?.ok) {
            console.warn('Sayı kaydı API başarısız:', r2.status, d2);
        }
    } catch (err) {
        console.warn('Sayı kaydı sırasında hata:', err);
    }
}

async function removeIssueFromDisk(number: number) {
    try {
        const r = await fetch(
            '/api/content/issues?number=' + encodeURIComponent(String(number)),
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );
        const d = await r.json().catch(() => ({} as any));
        if (!r.ok || !d?.ok) {
            console.warn('Sayı silme API başarısız:', r.status, d);
        }
    } catch (err) {
        console.warn('Sayı silme sırasında hata:', err);
    }
}

/** Diskten güncel sayı listesini oku, yoksa local store’a düş. */
async function loadIssuesFromDiskOrLocal(setIssuesFn: (x: Issue[]) => void) {
    try {
        const r = await fetch('/api/content/issues', { cache: 'no-store' });
        const d = await r.json().catch(() => ({} as any));
        const items: Issue[] = Array.isArray(d.items) ? d.items : [];
        if (items.length > 0) {
            setIssuesFn(items);
            return;
        }
    } catch (err) {
        console.warn('Diskten sayı okunamadı, local store kullanılacak:', err);
    }
    setIssuesFn(getIssues());
}

/* --------------------- Sayfa bileşeni --------------------- */

export default function AdminPage() {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);

    const [issues, setIssues] = useState<Issue[]>([]);
    const [arts, setArts] = useState<Article[]>([]);
    const [busy, setBusy] = useState(false);

    // düzenleme modları
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    // oturum + listeler
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me', { cache: 'no-store' });
                const d = await r.json();
                setMe(d?.email ? d : null);
            } catch {
                setMe(null);
            } finally {
                setLoading(false);
            }
        })();

        // 🔹 SAYILARI ÖNCE DİSKTEN, OLMAZSA LOCAL STORE’DAN YÜKLE
        (async () => {
            await loadIssuesFromDiskOrLocal(setIssues);

            // Yazılar şimdilik sadece local store’dan (dinamik eklenenler)
            setArts(getArticles());
        })();
    }, []);

    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' }).catch(() => {});
        } catch {}
        location.href = '/';
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center">
                Yükleniyor…
            </div>
        );
    }

    if (me?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-black text-white grid place-items-center p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 w-[380px] text-center">
                    <h1 className="text-amber-300 text-xl mb-2">
                        Yetkisiz Erişim
                    </h1>
                    <p className="text-white/70 mb-4">
                        Bu sayfa sadece{' '}
                        <span className="text-amber-300">admin</span> kullanıcıya açıktır.
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
            {/* içerik */}
            <div className="flex-1 p-6">
                {/* Üst bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/"
                        className="rounded-xl px-3.5 py-2 border border-amber-400/70 text-amber-300 bg-black/30 backdrop-blur-sm hover:bg-amber-400 hover:text-black transition shadow-sm"
                    >
                        ← Anasayfaya Dön
                    </Link>
                    <button
                        onClick={logout}
                        className="rounded-xl px-3.5 py-2 border border-white/14 text-white/75 bg-black/30 backdrop-blur-sm hover:bg-white/10 hover:text-white transition shadow-sm"
                    >
                        Çıkış
                    </button>
                </div>

                <h1 className="text-2xl text-amber-300 mb-6">
                    Geceyle Konuşmak — Admin Paneli
                </h1>

                {/* Yeni / Düzenle Sayı */}
                <IssueForm
                    editing={editingIssue}
                    onCancelEdit={() => setEditingIssue(null)}
                    onSave={async (i) => {
                        try {
                            setBusy(true);

                            // 1) local store (eski davranışı koruyalım)
                            saveIssue(i);

                            // 2) diske yaz
                            try {
                                await persistIssueToDisk(i);
                            } catch (err) {
                                console.warn('Sayı diske yazılamadı:', err);
                            }

                            // 3) 🔹 UI’ı mutlaka diskteki gerçek listeyle güncelle
                            await loadIssuesFromDiskOrLocal(setIssues);

                            setEditingIssue(null);
                        } finally {
                            setBusy(false);
                        }
                    }}
                />

                {/* Yeni / Düzenle Yazı */}
                <ArticleForm
                    issues={issues}
                    editing={editingArticle}
                    onCancelEdit={() => setEditingArticle(null)}
                    onSave={async (a) => {
                        try {
                            setBusy(true);
                            a.issueNumber = Number(a.issueNumber);

                            // local store
                            saveArticle(a);
                            setArts(getArticles());

                            // disk
                            await persistArticleToDisk(a);

                            setEditingArticle(null);
                        } finally {
                            setBusy(false);
                        }
                    }}
                />

                {/* Listeler */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {/* Sayılar listesi */}
                    <Card title="Sayılar">
                        {issues.length === 0 ? (
                            <p className="text-white/60">Henüz sayı yok.</p>
                        ) : (
                            <ul className="space-y-2">
                                {issues
                                    .slice()
                                    .sort((a, b) => b.number - a.number)
                                    .map((i) => (
                                        <li
                                            key={i.id}
                                            className="flex items-center justify-between rounded-lg border border-white/10 p-3 gap-3"
                                        >
                                            <div>
                                                <div className="text-amber-300">
                                                    Sayı {i.number} — {i.title}
                                                </div>
                                                <div className="text-xs text-white/60">
                                                    {i.date}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Düzenle */}
                                                <button
                                                    className="text-xs text-amber-200 hover:text-amber-100"
                                                    onClick={() => setEditingIssue(i)}
                                                >
                                                    Düzenle
                                                </button>

                                                {/* Sayfa açma butonu */}
                                                <Link
                                                    href={
                                                        i.number === 1
                                                            ? '/issue01'
                                                            : `/issues/${String(
                                                                i.number
                                                            ).padStart(2, '0')}`
                                                    }
                                                    className="text-amber-300 hover:text-amber-200 text-sm"
                                                    target="_blank"
                                                >
                                                    Aç
                                                </Link>

                                                <button
                                                    disabled={busy}
                                                    onClick={async () => {
                                                        try {
                                                            setBusy(true);

                                                            // local store’dan da sil
                                                            deleteIssue(i.id);

                                                            // diskte sil
                                                            await removeIssueFromDisk(
                                                                Number(i.number)
                                                            );

                                                            // 🔹 tekrar diskteki güncel listeyi oku
                                                            await loadIssuesFromDiskOrLocal(
                                                                setIssues
                                                            );

                                                            if (
                                                                editingIssue &&
                                                                editingIssue.id === i.id
                                                            ) {
                                                                setEditingIssue(null);
                                                            }
                                                        } finally {
                                                            setBusy(false);
                                                        }
                                                    }}
                                                    className="text-red-300 hover:text-red-200 disabled:opacity-50 text-sm"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </Card>

                    {/* Yazılar listesi */}
                    <Card title="Yazılar">
                        {arts.length === 0 ? (
                            <p className="text-white/60">Henüz yazı yok.</p>
                        ) : (
                            <ul className="space-y-2">
                                {arts
                                    .slice()
                                    .sort(
                                        (a, b) =>
                                            new Date(b.date as any).getTime() -
                                            new Date(a.date as any).getTime()
                                    )
                                    .map((a) => (
                                        <li
                                            key={a.id}
                                            className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                                        >
                                            <div>
                                                <div className="text-amber-300">
                                                    {a.title}
                                                </div>
                                                <div className="text-xs text-white/60">
                                                    Sayı {a.issueNumber} •{' '}
                                                    {a.authorId} • {a.date}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="text-xs text-amber-200 hover:text-amber-100"
                                                    onClick={() => setEditingArticle(a)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    disabled={busy}
                                                    onClick={async () => {
                                                        try {
                                                            setBusy(true);
                                                            deleteArticle(a.id); // UI
                                                            setArts(getArticles());
                                                            if (a.slug) {
                                                                await removeArticleFromDisk(
                                                                    a.slug
                                                                ); // Disk
                                                            }
                                                            if (
                                                                editingArticle &&
                                                                editingArticle.id === a.id
                                                            ) {
                                                                setEditingArticle(null);
                                                            }
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
                                    ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            {/* footer sadece admin panelinde */}
            <Footer />
        </div>
    );
}

/* ---------- Yardımcı Bileşenler ---------- */
function Card({ title, children }: { title: string; children: any }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-white/80 mb-3">{title}</div>
            {children}
        </div>
    );
}

/* ----------------- Sayı formu (yeni/düzenle) ----------------- */
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

    // editing değişince formu doldur / sıfırla
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
                    onChange={(e) =>
                        setNumber(parseInt(e.target.value || '0', 10))
                    }
                    placeholder="Sayı No"
                />
                <input
                    className="md:col-span-2 input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Başlık"
                />
                <input
                    className="md:col-span-2 input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                />
                <input
                    className="md:col-span-3 input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kısa açıklama"
                />
                <input
                    className="md:col-span-2 input"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="Kapak görseli (URL)"
                />
            </div>
            <div className="mt-3 flex gap-3">
                <button
                    onClick={() =>
                        onSave({
                            id:
                                id ??
                                crypto.randomUUID?.() ??
                                Math.random().toString(36).slice(2),
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

/* ----------------- Yazı formu (yeni/düzenle) ----------------- */
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
    const [issueNumber, setIssueNumber] = useState<number>(
        issues[0]?.number ?? 1
    );
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [authorId, setAuthorId] = useState('leon-varis'); // default
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [excerpt, setExcerpt] = useState('');
    const [embedUrl, setEmbedUrl] = useState('');
    const [body, setBody] = useState('');

    // issues ya da editing değişince formu doldur / sıfırla
    useEffect(() => {
        if (editing) {
            setId(editing.id);
            setIssueNumber(editing.issueNumber ?? issues[0]?.number ?? 1);
            setTitle(editing.title ?? '');
            setSlug(editing.slug ?? '');
            setAuthorId(editing.authorId ?? 'leon-varis');
            setDate(editing.date ?? new Date().toISOString().slice(0, 10));
            setExcerpt(editing.excerpt ?? '');
            setEmbedUrl(editing.embedUrl ?? '');
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
                {/* Hangi sayıya ait? */}
                <select
                    className="md:col-span-1 input"
                    value={issueNumber}
                    onChange={(e) =>
                        setIssueNumber(parseInt(e.target.value, 10))
                    }
                >
                    {issues
                        .slice()
                        .sort((a, b) => b.number - a.number)
                        .map((i) => {
                            const label = i.title
                                ? `Sayı ${i.number} — ${i.title}`
                                : `Sayı ${i.number}`;
                            return (
                                <option key={i.id} value={i.number}>
                                    {label}
                                </option>
                            );
                        })}
                </select>

                <input
                    className="md:col-span-3 input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Başlık"
                />
                <input
                    className="md:col-span-2 input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug (kısa-url)"
                />

                {/* Yazar dropdown'u */}
                <select
                    className="md:col-span-2 input"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                >
                    {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>

                <input
                    className="md:col-span-2 input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                />
                <input
                    className="md:col-span-2 input"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder="YouTube URL (opsiyonel)"
                />
                <input
                    className="md:col-span-6 input"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Kısa özet"
                />
                <textarea
                    className="md:col-span-6 input h-40"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="İçerik (opsiyonel)"
                />
            </div>
            <div className="mt-3 flex gap-3">
                <button
                    onClick={() =>
                        onSave({
                            id:
                                id ??
                                crypto.randomUUID?.() ??
                                Math.random().toString(36).slice(2),
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
