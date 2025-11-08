// pages/authors/[id].tsx
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { getAllAuthorIds, getAuthorById, type Author } from "../../data/authors";
import { getAllArticles } from "../../lib/cms";

type PageProps = {
    author: Author;
    articles: { slug: string; title: string; excerpt?: string | null }[];
};

export default function AuthorPage({ author, articles }: PageProps) {
    return (
        <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: author.color }} />
                <h1 className="text-4xl md:text-5xl text-amber-400">{author.name}</h1>
            </div>

            <p className="text-white/70 mt-2">
                {author.tagline} <span className="text-white/40">{author.handle}</span>
            </p>

            {/* ↓↓↓ YENİ: bio ve (opsiyonel) e-posta */}
            {author.bio && (
                <p className="mt-4 text-white/80 max-w-3xl leading-relaxed">
                    {author.bio}
                </p>
            )}
            {author.email && (
                <a href={`mailto:${author.email}`} className="mt-2 inline-block text-amber-300 hover:underline">
                    {author.email}
                </a>
            )}
            {/* ↑↑↑ */}

            <div className="mt-10 space-y-6">
                {articles.map(a => (
                    <Link
                        key={a.slug}
                        href={`/articles/${a.slug}`}
                        className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                        title={a.excerpt ?? undefined}
                    >
                        <div className="text-2xl text-amber-300">{a.title}</div>
                        {a.excerpt && <p className="text-white/70 mt-1">{a.excerpt}</p>}
                    </Link>
                ))}
                {articles.length === 0 && (
                    <p className="text-white/60">Bu yazarın henüz yayında yazısı yok.</p>
                )}
            </div>

            <div className="mt-10">
                <Link href="/issue01" className="text-amber-300 hover:underline">← Sayıya Dön</Link>
            </div>
        </main>
    );
}


export const getStaticPaths: GetStaticPaths = async () => {
    const ids = getAllAuthorIds(); // ✅ artık var
    return {
        paths: ids.map(id => ({ params: { id } })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
    const id = params!.id as string;
    const author = getAuthorById(id);
    if (!author) return { notFound: true };

    const all = getAllArticles();
    const articles = all
        .filter(a => a.authorId === id)
        .map(a => ({ slug: a.slug, title: a.title, excerpt: a.excerpt ?? null }));

    return { props: { author, articles } };
};
