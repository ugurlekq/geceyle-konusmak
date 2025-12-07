// /pages/articles/[...slug].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

import ArticleLayout from "@/components/ArticleLayout";
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";

type Props = {
    title: string | null;
    html: string | null;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

type RuntimeArticle = {
    title: string;
    body?: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

export default function ArticlePage({
                                        title,
                                        html,
                                        embedUrl,
                                        audioUrl,
                                        issueNumber,
                                    }: Props) {
    const router = useRouter();
    const [rt, setRt] = useState<RuntimeArticle | null>(null);

    useEffect(() => {
        // Eğer zaten CMS'ten html geldiyse adminStore'a bakmaya gerek yok
        if (html) return;

        const slugParts = ((router.query.slug as string[]) || []).filter(Boolean);
        if (!slugParts.length) return;

        const rawSlug = slugParts.join("/");
        const last = slugParts[slugParts.length - 1];

        (async () => {
            try {
                const { getArticles } = await import("@/lib/adminStore");
                const list = getArticles();

                // 1) Tam eşleşme
                let found = list.find((a) => a.slug === rawSlug);

                // 2) Sadece son parçaya bak (iyilesmek, hiclik-ve-zihin vs.)
                if (!found) {
                    found =
                        list.find((a) => a.slug === last) ||
                        list.find(
                            (a) =>
                                typeof a.slug === "string" &&
                                a.slug.endsWith("/" + last)
                        );
                }

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
                // adminStore import/okuma hatası olursa sessiz geç
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
                    ) : (
                        <p className="text-white/60">Yükleniyor…</p>
                    )}
                </motion.div>

                <div className="mt-10">
                    <BackLink href={issueHref} label="← Sayıya Dön" />
                </div>
            </ArticleLayout>
        </>
    );
}

/* helpers */
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

export const getStaticPaths: GetStaticPaths = async () => {
    const { getArticleSlugs } = await import("@/lib/cms");
    const slugs = getArticleSlugs();

    return {
        paths: slugs.map((s) => ({
            params: { slug: s.split("/") },
        })),
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const slugParts = ((params?.slug as string[]) || []).filter(Boolean);
    const last = slugParts[slugParts.length - 1] || "";
    const rawJoined = slugParts.join("/");

    const { getArticle } = await import("@/lib/cms");

    // Birkaç olası yolu sırayla dene
    const candidates: string[] = [];

    // 1) URL'in tamamı (arin-kael/articles/iyilesmek vs.)
    if (rawJoined) candidates.push(rawJoined);

    // 2) Sadece son parça (iyilesmek)
    if (last && last !== rawJoined) candidates.push(last);

    // 3) articles/<slug>
    if (last) candidates.push(`articles/${last}`);

    // 4) <authorId>/articles/<slug> kombinasyonları
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
            // denemeye devam et
        }
    }

    if (!a) {
        // Hiçbir adaydan dosya bulunamadı → html null dön
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
