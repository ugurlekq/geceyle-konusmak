// /pages/issues/[id].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";
import Footer from "@/components/Footer";

type AnyAuthor = { id: string; name: string; color?: string };
const AUTHORS: Record<string, AnyAuthor> = Object.fromEntries(
    (authors as AnyAuthor[]).map((a) => [a.id, a])
);

type Card = {
    slug: string;
    title: string;
    excerpt: string | null;
    authorId?: string | null;
    issueNumber: number;
    date?: string | null;
    embedUrl?: string | null;
    audioUrl?: string | null;
};

type Props = {
    issueNo: number;
    serverArticles: Card[];
    initialTitle: string | null;
    initialDesc: string | null;
};

export default function IssuePage({
                                      issueNo,
                                      serverArticles,
                                      initialTitle,
                                      initialDesc,
                                  }: Props) {
    const [localArts, setLocalArts] = useState<Card[]>([]);
    const [issueTitle, setIssueTitle] = useState<string | null>(
        initialTitle ?? null
    );
    const [issueDesc, setIssueDesc] = useState<string | null>(
        initialDesc ?? null
    );

    // İstersen admin panelden canlı düzenleme yapabil diye
    // eski adminStore mantığını koruyoruz; ama *başlangıç* verisi
    // artık server’dan (JSON dosyalarından) geliyor.
    useEffect(() => {
        (async () => {
            try {
                const mod = await import("@/lib/adminStore");

                // 1) Admin'den local yazıları çek (varsa)
                const mine = (mod.getArticles?.() ?? [])
                    .filter((a: any) => (Number(a.issueNumber) || 1) === issueNo)
                    .map(
                        (a: any): Card => ({
                            slug: String(a.slug),
                            title: String(a.title),
                            excerpt: a.excerpt ?? null,
                            authorId: a.authorId ?? null,
                            issueNumber: Number(a.issueNumber) || 1,
                            date: a.date ?? null,
                            embedUrl: a.embedUrl ?? null,
                            audioUrl: a.audioUrl ?? null,
                        })
                    );

                if (mine.length) setLocalArts(mine);

                // 2) AdminStore içindeki issue bilgisi varsa onu da uygula
                const issues = (mod.getIssues?.() ?? []) as any[];
                const current = issues.find(
                    (it: any) => Number(it.number) === issueNo
                );

                if (current) {
                    const t = (current as any).title;
                    const d = (current as any).description;

                    if (typeof t === "string" && t.trim().length > 0) {
                        setIssueTitle(t.trim());
                    }
                    if (typeof d === "string" && d.trim().length > 0) {
                        setIssueDesc(d.trim());
                    }
                }
            } catch {
                // adminStore yoksa sorun değil, server’dan gelen değerler kullanılır
            }
        })();
    }, [issueNo]);

    const list = useMemo(() => {
        const merged = [...serverArticles, ...localArts];
        const uniq = Array.from(new Map(merged.map((a) => [a.slug, a])).values());
        uniq.sort(
            (a, b) =>
                (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0)
        );
        return uniq;
    }, [serverArticles, localArts]);

    const label = String(issueNo).padStart(2, "0");

    const displayIssueName = issueTitle || `Sayı ${label}`;
    const displayIssueDesc = issueDesc || "Geceyle yazılmış parçalar.";

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            {/* içerik */}
            <div className="flex-1 px-6 py-12 max-w-4xl mx-auto">
                {/* Üst blok */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="candle-flicker text-4xl md:text-6xl text-amber-400">
                        Geceyle Konuşmak
                    </h1>

                    <h2 className="mt-4 text-2xl md:text-3xl text-amber-300">
                        {displayIssueName}
                    </h2>

                    <p className="mt-3 text-white/80">{displayIssueDesc}</p>

                    <div className="mt-4">
                        <BackLink href="/" label="← Anasayfaya Dön" />
                    </div>
                </motion.header>

                {/* Yazı listesi */}
                {list.length === 0 ? (
                    <p className="mt-10 text-white/60">Bu sayıya ait yazı yok.</p>
                ) : (
                    <>
                        <h3 className="mt-10 mb-4 text-xl text-amber-200">
                            Bu sayıya ait yazılar
                        </h3>

                        <div className="space-y-8">
                            {list.map((a, i) => {
                                const A = a.authorId ? AUTHORS[a.authorId] : undefined;
                                const color = A?.color ?? "#9ca3af";
                                const name = A?.name ?? "Bilinmeyen Yazar";

                                return (
                                    <motion.div
                                        key={a.slug}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            href={`/articles/${a.slug}`}
                                            className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                                        >
                                            <div className="text-2xl text-amber-300">{a.title}</div>
                                            {a.excerpt && (
                                                <p className="text-white/70 mt-1">{a.excerpt}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: color }}
                        />
                                                <span>{name}</span>
                                                {(a.embedUrl || a.audioUrl) && (
                                                    <span className="opacity-75 ml-1">🎧</span>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* alt kısım – tüm sayılarda ortak footer */}
            <Footer />
        </div>
    );
}

/* -------------------------- Static Paths -------------------------- */

export const getStaticPaths: GetStaticPaths = async () => {
    // content/issues.json içindeki tüm sayılar için path üret
    const issues = (await import("@/content/issues.json")).default as any[];

    const paths = issues.map((it) => ({
        params: { id: String(it.number).padStart(2, "0") },
    }));

    // Eğer 1. sayı issues.json’da yoksa, istersen bunu da ekleyebilirsin:
    // paths.push({ params: { id: "01" } });

    return { paths, fallback: "blocking" };
};

/* -------------------------- Static Props -------------------------- */

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const id = String(params?.id ?? "01");
    const issueNo = parseInt(id, 10) || 1;

    // 1) Yazı metadatasını content/articles/index.json'dan çek
    const rawArticles = (
        await import("@/content/articles/index.json")
    ).default as any[];

    const serverArticles: Card[] = rawArticles
        .filter((a) => (Number(a.issueNumber) || 1) === issueNo)
        .map(
            (a: any): Card => ({
                slug: String(a.slug),
                title: String(a.title),
                excerpt: a.excerpt ?? null,
                authorId: a.authorId ?? null,
                issueNumber: Number(a.issueNumber) || 1,
                date: a.date ?? null,
                embedUrl: a.embedUrl ?? null,
                audioUrl: a.audioUrl ?? null,
            })
        );

    // 2) Sayı başlık / açıklamasını content/issues.json'dan çek
    const issues = (await import("@/content/issues.json")).default as any[];
    const current = issues.find((it: any) => Number(it.number) === issueNo);

    const initialTitle =
        (current?.title as string | undefined)?.trim() ?? null;
    const initialDesc =
        (current?.description as string | undefined)?.trim() ?? null;

    return {
        props: {
            issueNo,
            serverArticles,
            initialTitle,
            initialDesc,
        },
        revalidate: 60,
    };
};
