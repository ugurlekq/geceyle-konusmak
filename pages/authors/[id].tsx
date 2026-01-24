// pages/authors/[id].tsx
import Header from '@/components/Header';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import type { Author } from '@/data/authors';
import { authors, getAllAuthorIds, getAuthorById } from '@/data/authors';
import BackLink from '@/components/BackLink';

type ArticleCard = {
    slug: string;
    title: string;
    excerpt?: string | null;
    issueNumber?: number | null;
    date?: string | null;
};

type Props = {
    author: Author;
    articles: ArticleCard[];
    allAuthors: Author[];
};

// Kabaca okuma süresi tahmini (dakika)
function estimateReadingTime(text?: string | null): number {
    if (!text) return 3;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.round(words / 200);
    return Math.max(2, Math.min(10, minutes || 3));
}

// Hex renk -> rgba (glow vb. için)
function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const int = parseInt(full, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function AuthorPage({ author, articles, allAuthors }: Props) {
    const router = useRouter();
    const [selectedAuthor, setSelectedAuthor] = useState(author.id);
    const [localArts, setLocalArts] = useState<ArticleCard[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const mod = await import('@/lib/adminStore');
                const list = (mod.getArticles?.() ?? [])
                    .filter((a: any) => a.authorId === author.id)
                    .map((a: any): ArticleCard => ({
                        slug: String(a.slug),
                        title: String(a.title),
                        excerpt: a.excerpt ?? null,
                        issueNumber: a.issueNumber ?? null,
                        date: a.date ?? null,
                    }));
                setLocalArts(list);
            } catch (err) {
                console.warn('local author articles load error', err);
            }
        })();
    }, [author.id]);

    const tags = author.traits ?? [];

    const sorted = useMemo(() => {
        const merged = [...articles, ...localArts];

        // slug bazlı tekilleştir
        const uniq = Array.from(new Map(merged.map((a) => [a.slug, a])).values());

        uniq.sort(
            (a, b) =>
                (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0),
        );

        return uniq;
    }, [articles, localArts]);

    const featured = sorted.slice(0, 2);
    const others = sorted.slice(2);

    const accent = author.color || '#f9b64c';

    const heroBg = author.heroImage || `/images/authors/${author.id}.png`;
    const avatarSrc = author.profileImage || `/images/authors/${author.id}.png`;
    
    const signature =
        author.signature ||
        author.highlightQuote ||
        'Bazı cümleler, sadece gece okunduğunda anlamını bulur.';


    return (
        <>
            <Header />

            <div className="min-h-screen px-6 py-10 md:py-14 max-w-5xl mx-auto">
                {/* Üst navigasyon + yazar seçimi */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <BackLink href="/" label="← Anasayfaya Dön" />

                    <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 hidden sm:inline">
              Yazar değiştir:
            </span>

                        <select
                            className="input bg-black/70 border-white/20 text-sm"
                            value={selectedAuthor}
                            onChange={(e) => {
                                const id = e.target.value;
                                setSelectedAuthor(id);
                                router.push(`/authors/${id}`);
                            }}
                        >
                            {allAuthors.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* HERO BLOĞU */}
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                    >
                        {/* Background image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-35"
                            style={{ backgroundImage: `url(${heroBg})` }}
                            aria-hidden
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/70" />

                        <div className="relative p-6 md:p-8 space-y-4">
                            <div className="flex items-start gap-3 md:gap-4">
                                {/* Avatar */}
                                <div
                                    className="relative h-[72px] w-[72px] md:h-[88px] md:w-[88px] lg:h-[96px] lg:w-[96px] rounded-full overflow-hidden border border-white/15 bg-white/5"
                                    style={{ boxShadow: `0 0 22px ${hexToRgba(accent, 0.28)}` }}
                                >
                                    <Image
                                        src={avatarSrc}
                                        alt={author.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>


                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                            backgroundColor: accent,
                            boxShadow: `0 0 12px ${hexToRgba(accent, 0.75)}`,
                        }}
                        aria-hidden
                    />
                                        <h1
                                            className="text-3xl md:text-4xl font-semibold"
                                            style={{ color: accent }}
                                        >
                                            {author.name}
                                        </h1>
                                    </div>

                                    <p className="text-sm text-white/60 mt-1">
                                        {author.tagline}{' '}
                                        <span className="text-white/40">{author.handle}</span>
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-white/75 leading-relaxed">
                                {author.bio}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-white/65">
                                {author.email && (
                                    <a
                                        href={`mailto:${author.email}`}
                                        className="px-3 py-1.5 rounded-full border border-white/20 bg-black/40 transition"
                                        style={{
                                            borderColor: hexToRgba(accent, 0.25),
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget.style.borderColor = hexToRgba(
                                                accent,
                                                0.6,
                                            ));
                                            (e.currentTarget.style.backgroundColor = hexToRgba(
                                                accent,
                                                0.08,
                                            ));
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget.style.borderColor = hexToRgba(
                                                accent,
                                                0.25,
                                            ));
                                            (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,.4)');
                                        }}
                                    >
                                        {author.email}
                                    </a>
                                )}

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((t) => (
                                            <span
                                                key={t}
                                                className="px-2.5 py-1 rounded-full bg-white/5 border text-[0.7rem] uppercase tracking-wide"
                                                style={{
                                                    borderColor: hexToRgba(accent, 0.22),
                                                }}
                                            >
                        {t}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* “İmza cümlesi” alanı */}
                            <div className="mt-2 border-t border-white/10 pt-3 text-sm md:text-base text-white/75 leading-relaxed">
                                {signature}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* YAZI LİSTESİ */}
                {sorted.length === 0 ? (
                    <p className="mt-8 text-white/60">Bu yazarın henüz eklenmiş bir yazısı yok.</p>
                ) : (
                    <>
                        {featured.length > 0 && (
                            <section className="mb-10">
                                <h2
                                    className="text-lg md:text-xl mb-3 font-medium"
                                    style={{ color: hexToRgba(accent, 0.9) }}
                                >
                                    Öne çıkan yazılar
                                </h2>

                                <div className="space-y-4">
                                    {featured.map((a, i) => {
                                        const mins = estimateReadingTime(a.excerpt);
                                        return (
                                            <motion.div
                                                key={a.slug}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                            >
                                                <Link
                                                    href={`/articles/${a.slug}`}
                                                    className="block rounded-xl border bg-white/5 hover:bg-white/8 transition px-5 py-4"
                                                    style={{
                                                        borderColor: hexToRgba(accent, 0.35),
                                                        boxShadow: `0 0 0 1px ${hexToRgba(accent, 0.12)}`,
                                                    }}
                                                >
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <div
                                                            className="text-lg md:text-xl"
                                                            style={{ color: hexToRgba(accent, 0.92) }}
                                                        >
                                                            {a.title}
                                                        </div>

                                                        <div className="text-xs text-white/70 whitespace-nowrap">
                                                            {a.issueNumber ? `Sayı ${a.issueNumber}` : ''}
                                                            {a.issueNumber ? ' • ' : ''}
                                                            {mins} dk okuma
                                                        </div>
                                                    </div>

                                                    {a.excerpt && (
                                                        <p className="text-white/80 mt-1 text-sm md:text-[0.95rem]">
                                                            {a.excerpt}
                                                        </p>
                                                    )}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {others.length > 0 && (
                            <section className="mb-6">
                                <h3 className="text-lg text-white/80 mb-3">Diğer yazılar</h3>

                                <div className="space-y-3">
                                    {others.map((a, i) => {
                                        const mins = estimateReadingTime(a.excerpt);
                                        return (
                                            <motion.div
                                                key={a.slug}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 + i * 0.05 }}
                                            >
                                                <Link
                                                    href={`/articles/${a.slug}`}
                                                    className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-5 py-3.5"
                                                >
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <div style={{ color: hexToRgba(accent, 0.85) }}>
                                                            {a.title}
                                                        </div>

                                                        <div className="text-[0.7rem] text-white/60 whitespace-nowrap">
                                                            {a.issueNumber ? `Sayı ${a.issueNumber}` : ''}
                                                            {a.issueNumber ? ' • ' : ''}
                                                            {mins} dk
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

/* ------------ SSG ------------ */

export const getStaticPaths: GetStaticPaths = async () => {
    const ids = getAllAuthorIds();
    return {
        paths: ids.map((id) => ({ params: { id } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const id = String(params?.id);
    const author = getAuthorById(id);

    if (!author) return { notFound: true };

    try {
        // 1) CMS (md)
        const { getAllArticles } = await import('@/lib/cms');
        const all = (getAllArticles() ?? []) as any[];

        const cmsArticles: ArticleCard[] = all
            .filter((a) => a.authorId === id)
            .map((a) => ({
                slug: String(a.slug),
                title: String(a.title),
                excerpt: a.excerpt ?? null,
                issueNumber: a.issueNumber ?? null,
                date: a.date ?? null,
            }));

        // 2) Supabase (published)
        let sbArticles: ArticleCard[] = [];
        try {
            const { supabaseAdmin } = await import('@/lib/server/supabaseAdmin');
            const sb = supabaseAdmin();

            const { data, error } = await sb
                .from('articles')
                .select('slug,title,excerpt,issue_number,date,author_id')
                .eq('author_id', id)
                .order('date', { ascending: false });

            if (!error && Array.isArray(data)) {
                sbArticles = data.map((a: any) => ({
                    slug: String(a.slug),
                    title: String(a.title),
                    excerpt: a.excerpt ?? null,
                    issueNumber: a.issue_number ?? null,
                    date: a.date ?? null,
                }));
            }
        } catch {
            sbArticles = [];
        }

        // 3) Merge + uniq (slug)
        const merged = [...cmsArticles, ...sbArticles];
        const uniq = Array.from(new Map(merged.map((a) => [a.slug, a])).values());

        return {
            props: {
                author,
                articles: uniq,
                allAuthors: authors,
            },
            revalidate: 60,
        };
    } catch {
        return {
            props: {
                author,
                articles: [],
                allAuthors: authors,
            },
            revalidate: 60,
        };
    }
};
