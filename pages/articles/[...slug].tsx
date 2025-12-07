// /pages/articles/[...slug].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ArticleLayout from "@/components/ArticleLayout";
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";
import { getArticleSlugs, getArticle } from "@/lib/cms";

// Sadece adminStore fallback'i için (local dev'te, isteğe bağlı)
type RuntimeArticle = {
    title: string;
    body?: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

type Props = {
    title: string | null;
    html: string | null;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

export default function ArticlePage(props: Props) {
    const { title, html, embedUrl, audioUrl, issueNumber } = props;

    const router = useRouter();
    const [rt, setRt] = useState<RuntimeArticle | null>(null);

    // İsteğe bağlı: sadece localStorage'daki adminStore'dan okuma (dev için)
    useEffect(() => {
        if (html) return; // zaten md'den gelmişse gerek yok

        const slugParts = ((router.query.slug as string[]) || []).filter(Boolean);
        if (!slugParts.length) return;
        const fullSlug = slugParts.join("/");
        const last = slugParts[slugParts.length - 1];

        (async () => {
            try {
                const { getArticles } = await import("@/lib/adminStore");
                const list = getArticles();
                const found =
                    list.find((a: any) => a.slug === fullSlug) ||
                    list.find((a: any) => a.slug === last) ||
                    list.find(
                        (a: any) =>
                            typeof a.slug === "string" && a.slug.endsWith("/" + last)
                    );

                if (found) {
                    setRt({
                        title: found.title,
                        body: found.body,
                        embedUrl: found.embedUrl ?? null,
                        audioUrl: found.audioUrl ?? null,
                        issueNumber: Number(found.issueNumber) || 1,
                    });
                }
            } catch {
                // prod'da adminStore olmayabilir → sessiz geç
            }
        })();
    }, [router.query.slug, html]);

    const finalTitle = rt?.title ?? title ?? "Yazı";
    const finalEmbed = rt?.embedUrl ?? embedUrl ?? null;
    const finalAudio = rt?.audioUrl ?? audioUrl ?? null;

    const finalIssueNo =
        rt?.issueNumber ??
        (typeof issueNumber === "number" ? issueNumber : null);

    const issueHref =
        finalIssueNo && finalIssueNo > 1
            ? `/issues/${String(finalIssueNo).padStart(2, "0")}`
            : "/issue01";

    const embed = finalEmbed ? toEmbed(finalEmbed) : null;
    const showLoading = !html && !rt;

    return (
        <>
            <Head>
                <title>{finalTitle}</title>
            </Head>

            <ArticleLayout title={finalTitle}>
                {(embed || finalAudio) && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
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
                                    <audio
                                        src={finalAudio!}
                                        controls
                                        className="w-full rounded-lg bg-black/30"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1.2 }}
                >
                    {html ? (
                        <div
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    ) : rt?.body ? (
                        <div className="prose prose-invert max-w-none">
                            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                                {rt.body}
                            </p>
                        </div>
                    ) : showLoading ? (
                        <p className="text-white/60">Yükleniyor…</p>
                    ) : (
                        <p className="text-white/60">
                            Bu yazı bulunamadı (production’da ilgili md dosyası yok).
                        </p>
                    )}
                </motion.div>

                <div className="mt-10">
                    <BackLink href={issueHref} label="← Sayıya Dön" />
                </div>
            </ArticleLayout>
        </>
    );
}

/* ----------------- embed helper ----------------- */

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
        const player =
            "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
        return { src: player, height: 166 };
    }

    return { src: url, height: 360 };
}

/* ----------------- SSG ----------------- */

export const getStaticPaths: GetStaticPaths = async () => {
    const slugs = getArticleSlugs(); // content altındaki tüm .md dosyaları

    return {
        paths: slugs.map((s) => ({
            params: { slug: s.split("/") },
        })),
        // Yeni md eklediğinde tekrar deploy gerektiriyor, ki sen zaten öyle yapıyorsun.
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const slugParts = ((params?.slug as string[]) || []).filter(Boolean);
    const rawJoined = slugParts.join("/");
    const last = slugParts[slugParts.length - 1] || "";

    const candidates: string[] = [];

    // 1) URL'in tamamı
    if (rawJoined) candidates.push(rawJoined);

    // 2) Sadece son parça
    if (last && last !== rawJoined) candidates.push(last);

    // 3) articles/<slug>
    if (last) candidates.push(`articles/${last}`);

    // 4) <authorId>/articles/<slug>
    if (last) {
        for (const a of authors) {
            candidates.push(`${a.id}/articles/${last}`);
        }
    }

    let a: any | null = null;
    for (const c of candidates) {
        try {
            a = getArticle(c);
            if (a) break;
        } catch {
            // sıradaki adayı dene
        }
    }

    if (!a) {
        // md bulunamadı → component "Bu yazı bulunamadı" diyecek
        return {
            props: {
                title: null,
                html: null,
                embedUrl: null,
                audioUrl: null,
                issueNumber: null,
            },
            revalidate: 60,
        };
    }

    return {
        props: {
            title: a.title ?? null,
            html: a.html ?? null,
            embedUrl: a.embedUrl ?? null,
            audioUrl: a.audioUrl ?? null,
            issueNumber:
                typeof a.issueNumber !== "undefined"
                    ? Number(a.issueNumber) || 1
                    : null,
        },
        revalidate: 60,
    };
};
