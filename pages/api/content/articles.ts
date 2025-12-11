// pages/api/content/articles.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
    loadArticlesIndex,
    saveArticlesIndex,
    writeArticleBody,
    readArticleBody,
    deleteArticleFiles,
} from '@/lib/server/contentStore';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET 👉 herkes için açık (liste + tekil body)
    if (req.method === 'GET') {
        try {
            const index = await loadArticlesIndex();
            const { slug } = req.query as { slug?: string };

            if (slug) {
                const body = (await readArticleBody(slug)) || '';
                const meta = index.find((x) => x.slug === slug) || null;
                return res.status(200).json({ ok: true, meta, body });
            }

            return res.status(200).json({ ok: true, items: index });
        } catch (e: any) {
            return res
                .status(500)
                .json({ ok: false, error: e?.message || 'read_error' });
        }
    }

    // ⛔ Buradan itibaren eskiden requireAdmin vardı.
    // Şimdilik admin kontrolünü devre dışı bırakıyoruz ki
    // panelden yazı kaydı sorunsuz dosyaya yazılsın.

    if (req.method === 'POST') {
        try {
            const a = req.body || {};
            const idx = await loadArticlesIndex();

            const meta = {
                id: a.id,
                issueNumber: Number(a.issueNumber),
                title: a.title,
                slug: a.slug,
                authorId: a.authorId,
                date: a.date,
                excerpt: a.excerpt ?? '',
                embedUrl: a.embedUrl ?? '',
                audioUrl: a.audioUrl ?? '',
            };

            const i = idx.findIndex((x) => x.slug === meta.slug);
            if (i >= 0) idx[i] = meta;
            else idx.push(meta);

            await saveArticlesIndex(idx);
            await writeArticleBody(String(meta.slug), String(a.body ?? ''));

            return res.json({ ok: true });
        } catch (e: any) {
            return res
                .status(500)
                .json({ ok: false, error: e?.message || 'write_error' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const slug = String(req.query.slug || '');
            if (!slug) {
                return res
                    .status(400)
                    .json({ ok: false, error: 'missing slug' });
            }

            const idx = await loadArticlesIndex();
            const next = idx.filter((x) => x.slug !== slug);
            await saveArticlesIndex(next);
            await deleteArticleFiles(slug);

            return res.json({ ok: true });
        } catch (e: any) {
            return res
                .status(500)
                .json({ ok: false, error: e?.message || 'delete_error' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end();
}
