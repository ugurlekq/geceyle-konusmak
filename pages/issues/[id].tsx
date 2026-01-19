// /pages/issues/[id].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import BackLink from "@/components/BackLink";
import { authors } from "@/data/authors";
import Footer from "@/components/Footer";
import SupportThisText from "@/components/SupportThisText";

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

type IssueInfo = {
    number: number;
    title: string | null;
    description: string | null;
};

function toCard(a: any, fallbackIssueNo: number): Card {
    return {
        slug: String(a.slug),
        title: String(a.title || ""),
        excerpt: a.excerpt ?? null,
        authorId: a.author_id ?? a.authorId ?? null,
        issueNumber: Number(a.issue_number ?? a.issueNumber) || fallbackIssueNo,
        date: a.date ?? null,
        embedUrl: a.embed_url ?? a.embedUrl ?? null,
        audioUrl: a.audio_url ?? a.audioUrl ?? null,
    };
}

export default function IssuePage({
                                      issueNo,
                                      serverArticles,
                                      initialTitle,
                                      initialDesc,
                                  }: Props) {
    const [localArts, setLocalArts] = useState<Card[]>([]);
    const [dbArts, setDbArts] = useState<Card[]>([]);
    const [issueTitle, setIssueTitle] = useState<string | null>(initialTitle ?? null);
    const [issueDesc, setIssueDesc] = useState<string | null>(initialDesc ?? null);

    /* ------------------ AdminStore override (varsa) ------------------ */
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const mod = await import("@/lib/adminStore");

                const mine = (mod.getArticles?.() ?? [])
                    .filter((a: any) => (Number(a.issueNumber) || 1) === issueNo)
                    .map((a: any) => ({
                        slug: String(a.slug),
                        title: String(a.title || ""),
                        excerpt: a.excerpt ?? null,
                        authorId: a.authorId ?? null,
                        issueNumber: Number(a.issueNumber) || issueNo,
                        date: a.date ?? null,
                        embedUrl: a.embedUrl ?? null,
                        audioUrl: a.audioUrl ?? null,
                    })) as Card[];

                if (!cancelled) setLocalArts(mine);

                const issues = (mod.getIssues?.() ?? []) as any[];
                const current = issues.find((it: any) => Number(it.number) === issueNo);
                if (current && !cancelled) {
                    const t = typeof current.title === "string" ? current.title.trim() : "";
                    const d = typeof current.description === "string" ? current.description.trim() : "";
                    if (t) setIssueTitle(t);
                    if (d) setIssueDesc(d);
                }
            } catch {
                // adminStore yoksa sessizce geç
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [issueNo]);

    /* ------------------ DB: Articles (public) ------------------ */
    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            try {
                const r = await fetch(
                    `/api/public/articles?issueNumber=${issueNo}&t=${Date.now()}`,
                    { cache: "no-store", signal: ac.signal }
                );
                const j = await r.json();
                const items = Array.isArray(j?.items) ? j.items : [];

                const mapped = items
                    .filter((x: any) => Number(x.issue_number ?? x.issueNumber ?? 0) === issueNo)
                    .map((x: any) => toCard(x, issueNo));

                setDbArts(mapped);
            } catch (e: any) {
                if (e?.name !== "AbortError") setDbArts([]);
            }
        })();

        return () => ac.abort();
    }, [issueNo]);

    /* ------------------ DB: Issue info (public) ------------------ */
    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            try {
                const r = await fetch(`/api/public/issues?number=${issueNo}&t=${Date.now()}`, {
                    cache: "no-store",
                    signal: ac.signal,
                });
                const j = await r.json();
                const item: IssueInfo | null = j?.item ?? null;

                if (item) {
                    const t = (item.title || "").trim();
                    const d = (item.description || "").trim();
                    if (t) setIssueTitle(t);
                    if (d) setIssueDesc(d);
                }
            } catch {
                // sessiz geç
            }
        })();

        return () => ac.abort();
    }, [issueNo]);

    /* ------------------ Merge + dedupe + sort ------------------ */
    const list = useMemo(() => {
        const merged = [...serverArticles, ...dbArts, ...localArts];
        const filtered = merged.filter((x) => x && x.slug && x.title);
        const uniq = Array.from(new Map(filtered.map((a) => [a.slug, a])).values());
        uniq.sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0));
        return uniq;
    }, [serverArticles, dbArts, localArts]);

    const label = String(issueNo).padStart(2, "0");
    const displayIssueName = issueTitle?.trim() ? issueTitle : `Sayı ${label}`;
    const displayIssueDesc = issueDesc?.trim() ? issueDesc : "Geceyle yazılmış parçalar.";

    // ✅ Destek scroll + flash (Issue01 ile aynı davranış)
    const supportId = "support";
    function goSupport(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        document.getElementById(supportId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${supportId}`);
        window.dispatchEvent(new CustomEvent("gk:flash-support", { detail: { id: supportId } }));
    }

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <Header />

            <div className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="candle-flicker text-4xl md:text-6xl text-amber-400">
                        Geceyle Konuşmak
                    </h1>

                    <h2 className="mt-4 text-2xl md:text-3xl text-amber-300">{displayIssueName}</h2>

                    <p className="mt-3 text-white/80">{displayIssueDesc}</p>

                    {/* ✅ Anasayfa + Destek aynı satır */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <BackLink href="/" label="← Anasayfaya Dön" />
                        <a
                            href={`#${supportId}`}
                            onClick={goSupport}
                            className="text-amber-300/80 hover:text-amber-200 transition"
                        >
                            • Destek ol
                        </a>
                    </div>
                </motion.header>

                {list.length === 0 ? (
                    <p className="mt-10 text-white/60">Bu sayıya ait yazı yok.</p>
                ) : (
                    <>
                        <h3 className="mt-10 mb-4 text-xl text-amber-200">Bu sayıya ait yazılar</h3>

                        <div className="space-y-6">
                            {list.map((a, i) => {
                                const A = a.authorId ? AUTHORS[a.authorId] : undefined;
                                const color = A?.color ?? "#9ca3af";
                                const name = A?.name ?? "Bilinmeyen Yazar";

                                return (
                                    <motion.div
                                        key={a.slug}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <Link
                                            href={`/articles/${a.slug}`}
                                            className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                                        >
                                            <div className="text-2xl text-amber-300">{a.title}</div>

                                            {a.excerpt && <p className="text-white/70 mt-1">{a.excerpt}</p>}

                                            <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: color }}
                        />
                                                <span>{name}</span>
                                                {(a.embedUrl || a.audioUrl) && <span className="opacity-75 ml-1">🎧</span>}
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ✅ anchor + flash hedefi */}
                <SupportThisText slug={`issue-${label}`} title={displayIssueName} anchorId={supportId} />
            </div>

            <Footer />
        </div>
    );
}

/* -------------------------- Static Paths -------------------------- */

export const getStaticPaths: GetStaticPaths = async () => {
    const issues = (await import("@/content/issues.json")).default as any[];

    const paths = issues.map((it) => ({
        params: { id: String(it.number).padStart(2, "0") },
    }));

    return { paths, fallback: "blocking" };
};

/* -------------------------- Static Props -------------------------- */

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const id = String(params?.id ?? "01");
    const issueNo = parseInt(id, 10) || 1;

    const rawArticles = (await import("@/content/articles/index.json")).default as any[];
    const serverArticles: Card[] = rawArticles
        .filter((a) => (Number(a.issueNumber) || 1) === issueNo)
        .map((a) => ({
            slug: String(a.slug),
            title: String(a.title || ""),
            excerpt: a.excerpt ?? null,
            authorId: a.authorId ?? null,
            issueNumber: Number(a.issueNumber) || issueNo,
            date: a.date ?? null,
            embedUrl: a.embedUrl ?? null,
            audioUrl: a.audioUrl ?? null,
        }));

    const issues = (await import("@/content/issues.json")).default as any[];
    const current = issues.find((it: any) => Number(it.number) === issueNo);

    const initialTitle = (current?.title as string | undefined)?.trim() ?? null;
    const initialDesc = (current?.description as string | undefined)?.trim() ?? null;

    return {
        props: { issueNo, serverArticles, initialTitle, initialDesc },
        revalidate: 60,
    };
};
