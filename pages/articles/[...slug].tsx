// pages/articles/[...slug].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import ArticleLayout from "../../components/ArticleLayout";

type Props = {
    title: string;
    html: string;
    embedUrl?: string | null;
    audioUrl?: string | null;
};

export default function ArticlePage({ title, html, embedUrl, audioUrl }: Props) {
    const embed = embedUrl ? toEmbed(embedUrl) : null;

    return (
        <>
            <Head><title>{title}</title></Head>
            <ArticleLayout title={title}>
                {/* (embed || audioUrl) bloğunu ŞU HALLE DEĞİŞTİR */}
                {(embed || audioUrl) && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_-15px_rgba(255,255,255,0.15)] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
                            {embed ? (
                                <iframe
                                    src={embed.src}
                                    width="100%"
                                    height={embed.height}
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                    className="rounded-2xl"
                                />
                            ) : (
                                <div className="p-4">
                                    <audio src={audioUrl!} controls className="w-full rounded-lg bg-black/30" />
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
                    <div
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </motion.div>

            </ArticleLayout>
        </>
    );
}

/* -------------------------------------------------------- */
function toEmbed(url: string): { src: string; height: number } | null {
    if (!url) return null;

    if (url.includes("youtube.com/watch")) {
        const u = new URL(url);
        const v = u.searchParams.get("v");
        const list = u.searchParams.get("list");
        if (!v) return null;
        const qs = new URLSearchParams();
        if (list) qs.set("list", list);
        qs.set("rel", "0");
        qs.set("modestbranding", "1");
        return { src: `https://www.youtube.com/embed/${v}?${qs}`, height: 360 };
    }
    if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
        if (id) return { src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, height: 360 };
    }
    if (url.includes("open.spotify.com/")) {
        return { src: url.replace("open.spotify.com/", "open.spotify.com/embed/"), height: 180 };
    }
    if (url.includes("soundcloud.com/")) {
        const player = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
        return { src: player, height: 166 };
    }
    return { src: url, height: 360 };
}

/* -------------------------------------------------------- */
export const getStaticPaths: GetStaticPaths = async () => {
    const { getArticleSlugs } = await import("../../lib/cms");
    const slugs = getArticleSlugs();
    return {
        paths: slugs.map(s => ({ params: { slug: s.split("/") } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const { getArticle } = await import("../../lib/cms");
    const slug = ((params?.slug as string[]) || []).join("/");
    const a = getArticle(slug);

    return {
        props: {
            title: a.title,
            html: a.html,
            embedUrl: a.embedUrl ?? null,
            audioUrl: a.audioUrl ?? null,
        },
    };
};
