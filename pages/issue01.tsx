// pages/issue01.tsx
import type { GetStaticProps } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import BackLink from "../components/BackLink";
import { authors } from "../data/authors"; // <- named export: Author[]

type ArticleCard = {
    slug: string;
    title: string;
    excerpt: string | null;
    authorId?: string | null;
    hasMedia?: boolean; // 🆕 embedUrl veya audioUrl var mı?
};


type Props = { articles: ArticleCard[] };

// data/authors tipinin minimum beklenen alanları
type AnyAuthor = { id: string; name: string; color?: string };

// Dizi gelirse id->author map'ine çevir; zaten map ise direkt kullan
function toAuthorMap(
    src: readonly AnyAuthor[] | Record<string, AnyAuthor>
): Record<string, AnyAuthor> {
    return Array.isArray(src)
        ? Object.fromEntries(src.map(a => [a.id, a]))
        : (src as Record<string, AnyAuthor>);
}

const AUTHORS = toAuthorMap(authors);

export default function Issue01({ articles }: Props) {
    return (
        <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="candle-flicker text-4xl md:text-6xl text-amber-400">Sayı 01 — Geceyle Konuşmak</h1>
                <p className="candle-flicker text-white/80 mt-3">Geceyle yazılmış üç parça.</p>
                <BackLink href="/" label="← Anasayfaya Dön" />
            </motion.div>

            <div className="mt-10 space-y-8">
                {articles.map((a, i) => {
                    const aAuthor = a.authorId ? AUTHORS[a.authorId] : undefined;
                    const badgeColor = aAuthor?.color ?? "#9ca3af";
                    const authorName = aAuthor?.name ?? "Bilinmeyen Yazar";

                    return (
                        <motion.div
                            key={a.slug}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                        >
                            <Link
                                href={`/articles/${a.slug}`}
                                className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                                aria-label={`${a.title} — ${authorName}`}
                            >
                                <div className="text-2xl text-amber-300">{a.title}</div>
                                {a.excerpt ? <p className="text-white/70 mt-1">{a.excerpt}</p> : null}

                                {/* yazar etiketi */}
                                <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                                    <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: badgeColor }} />
                                    <span>{authorName}</span>
                                    {a.hasMedia && <span className="opacity-75 ml-1" title="Müzik/Video var">🎧</span>} {/* 🆕 */}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    const { getAllArticles } = await import("../lib/cms");
    const all = getAllArticles();

    const articles = all.map(a => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt ?? null,
        authorId: a.authorId ?? null,
        hasMedia: !!(a.embedUrl || a.audioUrl), // 🆕
    }));

    return { props: { articles } };
};
