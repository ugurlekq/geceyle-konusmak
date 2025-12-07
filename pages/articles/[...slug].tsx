// /pages/articles/[...slug].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { motion } from "framer-motion";

import ArticleLayout from "@/components/ArticleLayout";
import BackLink from "@/components/BackLink";

/* ----------------- Ortak tipler ----------------- */

type Props = {
    title: string | null;
    html: string | null;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

/* ----------------- Sayfa bileşeni ----------------- */

export default function ArticlePage({
                                        title,
                                        html,
                                        embedUrl,
                                        audioUrl,
                                        issueNumber,
                                    }: Props) {
    const finalTitle = title ?? "Yazı";
    const embed = embedUrl ? toEmbed(embedUrl) : null;
    const issueNo =
        typeof issueNumber === "number" && !Number.isNaN(issueNumber)
            ? issueNumber
            : null;

    const issueHref =
        issueNo && issueNo > 1
            ? `/issues/${String(issueNo).padStart(2, "0")}`
            : "/issue01";

    return (
        <>
            <Head>
                <title>{finalTitle}</title>
            </Head>

            <ArticleLayout title={finalTitle}>
                {(embed || audioUrl) && (
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
                                        src={audioUrl!}
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
                    ) : (
                        <p className="text-white/60">Bu yazı bulunamadı.</p>
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

/* ----------------- fs ile JSON okuma ----------------- */

import fs from "fs";
import path from "path";

type ArticleLike = {
    slug: string;
    title: string;
    body?: string;
    html?: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
    issueNumber?: number | null;
};

/** data/articles.json içindeki (commit edilmiş) dinamik yazıları oku */
function readDynamicArticles(): ArticleLike[] {
    try {
        const filePath = path.join(process.cwd(), "data", "articles.json");
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed?.items) ? parsed.items : parsed;
        return Array.isArray(items) ? (items as ArticleLike[]) : [];
    } catch {
        return [];
    }
}

/* ----------------- SSG ----------------- */

export const getStaticPaths: GetStaticPaths = async () => {
    const { getArticleSlugs } = await import("@/lib/cms");
    const slugs = getArticleSlugs();

    return {
        paths: slugs.map((s) => ({
            params: { slug: s.split("/") },
        })),
        // Yeni yazılar için fallback: blocking → ilk istekte build edilir
        fallback: "blocking",
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const slugParts = ((params?.slug as string[]) || []).filter(Boolean);
    const fullSlug = slugParts.join("/");
    const last = slugParts[slugParts.length - 1] || "";

    const { getArticle } = await import("@/lib/cms");

    let a: any | null = null;

    // 1) Markdown’dan dene
    try {
        a = getArticle(fullSlug);
    } catch {
        a = null;
    }

    // 2) Olmazsa data/articles.json’dan dene
    if (!a) {
        const dyn = readDynamicArticles().find(
            (x) =>
                x.slug === fullSlug ||
                x.slug === last ||
                (typeof x.slug === "string" && x.slug.endsWith("/" + last))
        );

        if (dyn) {
            return {
                props: {
                    title: dyn.title ?? null,
                    html: dyn.html ?? dyn.body ?? null,
                    embedUrl: dyn.embedUrl ?? null,
                    audioUrl: dyn.audioUrl ?? null,
                    issueNumber:
                        typeof dyn.issueNumber !== "undefined"
                            ? Number(dyn.issueNumber) || 1
                            : null,
                },
                revalidate: 60,
            };
        }
    }

    // 3) Markdown bulunduysa
    if (a) {
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
    }

    // 4) Hiçbir şey bulunamadı → 404
    return {
        notFound: true,
        revalidate: 60,
    };
};
