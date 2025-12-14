// /pages/articles/[...slug].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { marked } from "marked";

import ArticleLayout from "@/components/ArticleLayout";
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";

/* ----------------------------------------------------
 * Ortak tipler
 * -------------------------------------------------- */

type ArticleLike = {
    slug: string;
    title: string;
    body?: string;
    html?: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
    authorId?: string | null;
    date?: string | null;
};

type Props = {
    title: string | null;
    html: string | null;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
    authorId?: string | null;
    date?: string | null;
};

type RuntimeArticle = {
    title: string;
    body?: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
    authorId?: string | null;
    date?: string | null;
};

type CommentRow = {
    id: string;
    slug: string;
    content: string;
    created_at: string;
    is_hidden: boolean;
};

/* ----------------------------------------------------
 * Sayfa bileşeni
 * -------------------------------------------------- */

export default function ArticlePage({
                                        title,
                                        html,
                                        embedUrl,
                                        audioUrl,
                                        issueNumber,
                                        authorId,
                                        date,
                                    }: Props) {
    const router = useRouter();
    const [rt, setRt] = useState<RuntimeArticle | null>(null);

    // ✅ Sayfanın gerçek slug'ı (full path)
    const slugParts = ((router.query.slug as string[]) || []).filter(Boolean);
    const pageSlug = useMemo(() => slugParts.join("/"), [slugParts.join("/")]); // stable-ish

    // ✅ Meta state (tek kaynaktan)
    const [likeCount, setLikeCount] = useState<number>(0);
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [loadingMeta, setLoadingMeta] = useState(false);

    // ✅ Like / Comment action state
    const [liking, setLiking] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commenting, setCommenting] = useState(false);

    // ✅ Auto-grow textarea ref
    const taRef = useRef<HTMLTextAreaElement | null>(null);

    function autoGrowTextarea() {
        const el = taRef.current;
        if (!el) return;
        el.style.height = "0px";                       // kritik
        el.style.height = Math.min(el.scrollHeight, 220) + "px";
    }

    function getVisitorId() {
        if (typeof window === "undefined") return "server";
        const k = "gk_vid";
        let v = localStorage.getItem(k);
        if (!v) {
            v = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + "-" + Date.now();
            localStorage.setItem(k, v);
        }
        return v;
    }


    async function refreshMeta() {
        if (!pageSlug) return;
        setLoadingMeta(true);
        try {
            const r = await fetch(`/api/article-meta?slug=${encodeURIComponent(pageSlug)}`);
            const j = await r.json().catch(() => null);

            if (r.ok && j?.ok) {
                setLikeCount(Number(j.likeCount) || 0);
                setComments(Array.isArray(j.comments) ? j.comments : []);
            }
        } finally {
            setLoadingMeta(false);
        }
    }

    useEffect(() => {
        if (!pageSlug) return;
        refreshMeta();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSlug]);
    
    useEffect(() => {
        autoGrowTextarea();
    }, [commentText]);

    async function sendLike() {
        if (!pageSlug || liking) return;
        setLiking(true);
        try {
            const r = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: pageSlug, visitorId: getVisitorId() }),
            });
            if (r.ok) {
                // sayaç göstermek istemesen bile backend doğru çalışsın diye meta’yı yeniliyoruz
                await refreshMeta();
            }
        } finally {
            setLiking(false);
        }
    }

    async function sendComment() {
        if (!pageSlug || commenting) return;
        const txt = commentText.trim();
        if (!txt) return;

        setCommenting(true);
        try {
            const r = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: pageSlug, content: txt }),
            });
            const j = await r.json().catch(() => null);

            if (r.ok && j?.ok && j?.inserted) {
                // ✅ YouTube hissi: yeni yorum ALTTA belirsin, input yerinden oynamasın
                setComments((prev) => [...prev, j.inserted as CommentRow]);
                setCommentText("");
                requestAnimationFrame(() => {
                    autoGrowTextarea();
                    taRef.current?.focus();
                });
            } else if (r.ok && j?.ok) {
                // inserted dönmediyse güvenli fallback
                setCommentText("");
                await refreshMeta();
            }
        } finally {
            setCommenting(false);
        }
    }

    // ---- Development için: localStorage/adminStore fallback'i ----
    useEffect(() => {
        // Build sırasında CMS'ten html geldiyse adminStore'a bakmaya gerek yok
        if (html) return;

        const slugParts2 = ((router.query.slug as string[]) || []).filter(Boolean);
        if (!slugParts2.length) return;

        const fullSlug = slugParts2.join("/");
        const last = slugParts2[slugParts2.length - 1];

        (async () => {
            try {
                const { getArticles } = await import("@/lib/adminStore");
                const list = getArticles();

                let found: any =
                    // 1) Tam slug
                    list.find((a) => a.slug === fullSlug) ??
                    // 2) Sadece son parçaya göre (iyilesmek vs.)
                    list.find((a) => a.slug === last) ??
                    list.find((a) => typeof a.slug === "string" && a.slug.endsWith("/" + last));

                if (found) {
                    setRt({
                        title: found.title,
                        body: found.body,
                        embedUrl: found.embedUrl ?? null,
                        audioUrl: found.audioUrl ?? null,
                        issueNumber: Number(found.issueNumber) || 1,
                        authorId: found.authorId ?? null,
                        date: found.date ?? null,
                    });
                }
            } catch {
                // adminStore import hatası → sessiz geç
            }
        })();
    }, [router.query.slug, html]);

    // ---- Ortak final değerler (statik + dinamik) ----
    const finalTitle = rt?.title ?? title ?? "Yazı";
    const finalEmbed = rt?.embedUrl ?? embedUrl ?? null;
    const finalAudio = rt?.audioUrl ?? audioUrl ?? null;

    const finalIssueNo = rt?.issueNumber ?? (typeof issueNumber === "number" ? issueNumber : null);

    const finalAuthorId = rt?.authorId ?? authorId ?? null;
    const finalDate = rt?.date ?? date ?? null;

    const author = (finalAuthorId && authors.find((a) => a.id === finalAuthorId)) || null;

    const issueHref =
        finalIssueNo && finalIssueNo > 1 ? `/issues/${String(finalIssueNo).padStart(2, "0")}` : "/issue01";

    const embed = finalEmbed ? toEmbed(finalEmbed) : null;

    const showLoading = !html && !rt;

    // Tarihi azıcık güzelleştirelim
    const formattedDate =
        finalDate && !Number.isNaN(Date.parse(finalDate))
            ? new Date(finalDate).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : null;

    return (
        <>
            <Head>
                <title>{finalTitle}</title>
            </Head>

            <ArticleLayout title={finalTitle}>
                {/* Meta satırı: yazar + sayı + tarih */}
                {(author || finalIssueNo || formattedDate) && (
                    <div className="text-sm text-white/60 mb-6">
                        {author && <span>{author.name}</span>}
                        {finalIssueNo && (
                            <span>
                {author ? " • " : ""}
                                Sayı {finalIssueNo}
              </span>
                        )}
                        {formattedDate && (
                            <span>
                {author || finalIssueNo ? " • " : ""}
                                {formattedDate}
              </span>
                        )}
                    </div>
                )}

                {/* Embed / audio bloğu */}
                {(embed || finalAudio) && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
                        <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
                            {embed ? (
                                <iframe
                                    src={embed.src}
                                    width="100%"
                                    height={embed.height}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="rounded-2xl"
                                    title={`${finalTitle} — embed`}
                                />
                            ) : (
                                <div className="p-4">
                                    <audio src={finalAudio!} controls className="w-full rounded-lg bg-black/30" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* İçerik */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1.2 }}>
                    {html ? (
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
                    ) : rt?.body ? (
                        <div className="prose prose-invert max-w-none">
                            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{rt.body}</p>
                        </div>
                    ) : showLoading ? (
                        <p className="text-white/60">Yükleniyor…</p>
                    ) : (
                        <p className="text-white/60">Bu yazı bulunamadı (production’da md dosyası / json’u yok).</p>
                    )}
                </motion.div>

                {/* ✅ Like + Comments (composer ÜSTTE, liste ALTTA) */}
                <div className="mt-10 border-t border-white/10 pt-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={sendLike}
                            disabled={!pageSlug || liking}
                            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition"
                        >
                            {liking ? "Beğeniliyor…" : "❤️ Beğen"}
                        </button>

                        {/* İstersen bunu kaldırırız; kalsın diye sen eklemiştin */}
                        <div className="text-white/70 text-sm">{likeCount} beğeni</div>

                        {loadingMeta && <div className="text-white/40 text-xs">senkron…</div>}
                    </div>

                    <div className="mt-8">
                        <div className="text-white/80 font-semibold mb-3">Yorumlar</div>

                        {/* ✅ Composer önce (YouTube hissi) */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
             <textarea
                 ref={taRef}
                 rows={1}
                 value={commentText}
                 onChange={(e) => {
                     setCommentText(e.target.value);
                 }}
                 onInput={autoGrowTextarea}
                 className="w-full bg-transparent outline-none text-white/90 resize-none"
                 style={{ overflow: "hidden" }}
             />

                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={sendComment}
                                    disabled={!pageSlug || commenting || !commentText.trim()}
                                    className="px-4 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                                >
                                    {commenting ? "Gönderiliyor…" : "Yorum gönder"}
                                </button>
                            </div>
                        </div>

                        {/* ✅ Liste sonra (yeni yorum en ALTA eklenir) */}
                        <div className="space-y-3">
                            {comments.length === 0 ? (
                                <div className="text-white/50 text-sm">Henüz yorum yok.</div>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-white/90 whitespace-pre-wrap">{c.content}</div>
                                        <div className="text-white/40 text-xs mt-2">
                                            {new Date(c.created_at).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sayfaya geri link */}
                <div className="mt-10">
                    <BackLink href={issueHref} label="← Sayıya Dön" />
                </div>
            </ArticleLayout>
        </>
    );
}

/* ----------------------------------------------------
 * Embed helper
 * -------------------------------------------------- */

function toEmbed(url: string): { src: string; height: number } | null {
    if (!url) return null;

    if (url.includes("youtube.com/watch")) {
        const u = new URL(url);
        const v = u.searchParams.get("v");
        if (!v) return null;
        const qs = new URLSearchParams();
        const list = u.searchParams.get("list");
        if (list) qs.set("list", list);
        qs.set("rel", "0");
        qs.set("modestbranding", "1");
        return {
            src: `https://www.youtube.com/embed/${v}?${qs.toString()}`,
            height: 360,
        };
    }

    if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
        if (id)
            return {
                src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
                height: 360,
            };
    }

    if (url.includes("open.spotify.com/")) {
        return {
            src: url.replace("open.spotify.com/", "open.spotify.com/embed/"),
            height: 180,
        };
    }

    if (url.includes("soundcloud.com/")) {
        const player = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
        return { src: player, height: 166 };
    }

    return { src: url, height: 360 };
}

/* ----------------------------------------------------
 * SSG
 * -------------------------------------------------- */

export const getStaticPaths: GetStaticPaths = async () => {
    const { getArticleSlugs } = await import("@/lib/cms");
    const slugs = getArticleSlugs(); // content altındaki tüm .md dosyaları

    return {
        paths: slugs.map((s) => ({
            params: { slug: s.split("/") },
        })),
        // Admin panelden gelen yazılar için fallback blocking:
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const slugParts = ((params?.slug as string[]) || []).filter(Boolean);
    const fullSlug = slugParts.join("/");

    const { getArticle } = await import("@/lib/cms");

    try {
        const a = getArticle(fullSlug);

        return {
            props: {
                title: a.title ?? null,
                html: a.html ?? null,
                embedUrl: a.embedUrl ?? null,
                audioUrl: a.audioUrl ?? null,
                issueNumber: a.issueNumber ?? null,
                authorId: a.authorId ?? null,
                date: a.date ?? null,
            },
            revalidate: 60,
        };
    } catch {
        return {
            props: {
                title: null,
                html: null,
                embedUrl: null,
                audioUrl: null,
                issueNumber: null,
                authorId: null,
                date: null,
            },
            revalidate: 60,
        };
    }
};
