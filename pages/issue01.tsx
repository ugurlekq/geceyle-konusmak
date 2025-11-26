// pages/issue01.tsx
import type { GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BackLink from "../components/BackLink";
import { authors } from "../data/authors";
import Footer from "../components/Footer";

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
    (authors as AnyAuthor[]).map(a => [a.id, a])
);

export default function Issue01({ articles = [] }: Props) {
    const [dyn, setDyn] = useState<ArticleCard[]>([]);
    const [issueDesc, setIssueDesc] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const mod = await import("@/lib/adminStore");
                const raws = (mod.getArticles?.() ?? []) as any[];

                // 1) Yalnızca Sayı 01'e ait local yazılar
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
                        issueNumber: Number(a.issueNumber) || 1,
                    })) as ArticleCard[];

                setDyn(mine);

                // 2) Sayı 01 açıklamasını / özetini adminStore'dan çek
                let desc: string | null = null;

                // getIssueDescription(1)
                if (typeof (mod as any).getIssueDescription === "function") {
                    desc = (mod as any).getIssueDescription(1) ?? null;
                }

                // getIssueMeta(1) → { description / summary / ozet }
                if (!desc && typeof (mod as any).getIssueMeta === "function") {
                    const meta = (mod as any).getIssueMeta(1);
                    if (meta) {
                        if (typeof meta.description === "string") desc = meta.description;
                        else if (typeof meta.summary === "string") desc = meta.summary;
                        else if (typeof (meta as any).ozet === "string") desc = (meta as any).ozet;
                    }
                }

                // getIssues() → [{ issueNumber / no / id, description / summary / ozet }]
                if (!desc && typeof (mod as any).getIssues === "function") {
                    const all = (mod as any).getIssues() ?? [];
                    const found = all.find((it: any) => {
                        const n =
                            Number(it.issueNumber) ||
                            Number(it.no) ||
                            Number(it.id);
                        return n === 1;
                    });
                    if (found) {
                        if (typeof found.description === "string") desc = found.description;
                        else if (typeof found.summary === "string") desc = found.summary;
                        else if (typeof (found as any).ozet === "string") desc = (found as any).ozet;
                    }
                }

                if (desc && desc.trim().length > 0) {
                    setIssueDesc(desc.trim());
                }
            } catch {
                // sessizce geç
            }
        })();
    }, []);

    // CMS + Admin -> yalnızca #1
    const list = [...articles, ...dyn]
        // Sadece 1. sayıya ait olanlar
        .filter((x) => (x.issueNumber ?? 1) === 1)
        // Sadece bozuk slug'ları gizle (articles/ ile başlayanlar)
        .filter((x) => !x.slug?.startsWith("articles/"))
        // Tarihe göre sırala
        .sort(
            (a, b) =>
                (Date.parse(b.date || "") || 0) -
                (Date.parse(a.date || "") || 0)
        );


    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="candle-flicker text-4xl md:text-6xl text-amber-400">
                        Geceyle Konuşmak
                    </h1>

                    <h2 className="mt-4 text-2xl md:text-3xl text-amber-300">
                        Sayı 01 — İlk Gece
                    </h2>

                    <p className="candle-flicker text-white/80 mt-3">
                        {issueDesc || "Geceyle yazılmış parçalar."}
                    </p>
                    <BackLink href="/" label="← Anasayfaya Dön" />
                </motion.div>

                {list.length === 0 ? (
                    <p className="mt-10 text-white/60">
                        Bu sayıya ait yazı bulunamadı.
                    </p>
                ) : (
                    <div className="mt-10 space-y-8">
                        {list.map((a, i) => {
                            const aAuthor = a.authorId
                                ? AUTHORS[a.authorId]
                                : undefined;
                            const badgeColor = aAuthor?.color ?? "#9ca3af";
                            const authorName =
                                aAuthor?.name ?? "Bilinmeyen Yazar";

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
                                        {a.excerpt ? (
                                            <p className="text-white/70 mt-1">
                                                {a.excerpt}
                                            </p>
                                        ) : null}
                                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-full"
                                                style={{ background: badgeColor }}
                                            />
                                            <span>{authorName}</span>
                                            {a.hasMedia && (
                                                <span
                                                    className="opacity-75 ml-1"
                                                    title="Müzik/Video var"
                                                >
                                                    🎧
                                                </span>
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
            .filter(a => (Number(a.issueNumber) || 1) === 1)
            .map(a => ({
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt ?? null,
                authorId: a.authorId ?? null,
                hasMedia: !!(a.embedUrl || a.audioUrl),
                date: a.date ?? null,
                issueNumber: Number(a.issueNumber) || 1,
            })) as ArticleCard[];
        return { props: { articles: onlyIssue1 } };
    } catch {
        return { props: { articles: [] } };
    }
};
