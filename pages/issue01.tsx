// /pages/issue01.tsx
import type { GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Header from "@/components/Header"; // ✅ EKLENDİ
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";
import Footer from "@/components/Footer";

type ArticleCard = {
    slug: string;
    title: string;
    excerpt: string | null;
    authorId?: string | null;
    hasMedia?: boolean;
    date?: string | null;
    issueNumber?: number | null;
};

type Props = { articles: ArticleCard[] };

type AnyAuthor = { id: string; name: string; color?: string };
const AUTHORS: Record<string, AnyAuthor> = Object.fromEntries(
    (authors as AnyAuthor[]).map((a) => [a.id, a])
);

// ✅ SABİT METNİ FARKLI İSİMLE TUT
const ISSUE01_DESC_FALLBACK =
    "İlk Gece; günün artık sustuğu, cümlelerin kendine ait bir ses bulmaya başladığı eşiktir. Bu sayıda metinler anlatmaz, eşlik eder. Okurla birlikte yavaşlar, birlikte düşünür.";

export default function Issue01({ articles = [] }: Props) {
    const [dyn, setDyn] = useState<ArticleCard[]>([]);
    const [issueDesc, setIssueDesc] = useState<string>(ISSUE01_DESC_FALLBACK);

    useEffect(() => {
        (async () => {
            try {
                const mod = await import("@/lib/adminStore");
                const raws = (mod.getArticles?.() ?? []) as any[];

                const mine = raws
                    .filter((a: any) => Number(a.issueNumber) === 1)
                    .filter((a: any) => a?.slug && a?.title)
                    .map((a: any) => ({
                        slug: a.slug,
                        title: a.title,
                        excerpt: a.excerpt ?? null,
                        authorId: a.authorId ?? null,
                        hasMedia: !!(a.embedUrl || a.audioUrl),
                        date: a.date ?? null,
                        issueNumber: 1,
                    })) as ArticleCard[];

                setDyn(mine);

                // Sayı 01 açıklamasını adminStore'dan override et (varsa)
                let desc: string | null = null;

                if (typeof (mod as any).getIssues === "function") {
                    const all = (mod as any).getIssues() ?? [];
                    const found = all.find((it: any) => Number(it.number) === 1);
                    if (found?.description) desc = found.description;
                }

                if (desc?.trim()) setIssueDesc(desc.trim());
            } catch {
                // sessiz geç
            }
        })();
    }, []);

    const list = [...articles, ...dyn]
        .filter((x) => (x.issueNumber ?? 1) === 1)
        .sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <Header /> {/* ✅ ARTIK BURADA */}

            <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="candle-flicker text-4xl md:text-6xl text-amber-400">
                        Geceyle Konuşmak
                    </h1>

                    <h2 className="mt-4 text-2xl md:text-3xl text-amber-300">
                        İlk Gece
                    </h2>

                    <p className="text-white/80 mt-3 leading-relaxed">
                        {issueDesc}
                    </p>

                    <div className="mt-4">
                        <BackLink href="/" label="← Anasayfaya Dön" />
                    </div>

                    <h3 className="mt-14 text-2xl md:text-3xl text-amber-300">
                        Bu sayıya ait yazılar
                    </h3>
                </motion.div>

                {list.length === 0 ? (
                    <p className="mt-10 text-white/60">
                        Bu sayıya ait yazı bulunamadı.
                    </p>
                ) : (
                    <div className="mt-10 space-y-8">
                        {list.map((a, i) => {
                            const A = a.authorId ? AUTHORS[a.authorId] : undefined;
                            const badgeColor = A?.color ?? "#9ca3af";
                            const authorName = A?.name ?? "Bilinmeyen Yazar";

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
                                    >
                                        <div className="text-2xl text-amber-300">
                                            {a.title}
                                        </div>

                                        {a.excerpt && (
                                            <p className="text-white/70 mt-1">
                                                {a.excerpt}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ background: badgeColor }}
                                            />
                                            <span>{authorName}</span>
                                            {a.hasMedia && (
                                                <span className="opacity-75 ml-1">🎧</span>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    try {
        const { getAllArticles } = await import("../lib/cms");
        const all = (getAllArticles() ?? []) as any[];

        const onlyIssue1 = all
            .filter((a) => (Number(a.issueNumber) || 1) === 1)
            .map((a) => ({
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt ?? null,
                authorId: a.authorId ?? null,
                hasMedia: !!(a.embedUrl || a.audioUrl),
                date: a.date ?? null,
                issueNumber: 1,
            })) as ArticleCard[];

        return { props: { articles: onlyIssue1 } };
    } catch {
        return { props: { articles: [] } };
    }
};
