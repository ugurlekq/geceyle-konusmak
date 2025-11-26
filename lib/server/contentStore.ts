// lib/server/contentStore.ts
import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const ISSUES_PATH = path.join(CONTENT_DIR, 'issues.json');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');
const ARTICLES_INDEX = path.join(ARTICLES_DIR, 'index.json');

async function ensureStructure() {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    await fs.mkdir(ARTICLES_DIR, { recursive: true });
    try { await fs.access(ISSUES_PATH); } catch { await fs.writeFile(ISSUES_PATH, '[]'); }
    try { await fs.access(ARTICLES_INDEX); } catch { await fs.writeFile(ARTICLES_INDEX, '[]'); }
}

export type IssueFile = {
    id: string;
    number: number;
    title: string;
    date: string;
    description?: string;
    coverUrl?: string;
};

export type ArticleFileMeta = {
    id: string;
    issueNumber: number;
    title: string;
    slug: string;
    authorId: string;
    date: string;
    excerpt?: string;
    embedUrl?: string;
    audioUrl?: string;
};

export async function loadIssues(): Promise<IssueFile[]> {
    await ensureStructure();
    const buf = await fs.readFile(ISSUES_PATH, 'utf8');
    return JSON.parse(buf);
}

export async function saveIssues(items: IssueFile[]) {
    await ensureStructure();
    await fs.writeFile(ISSUES_PATH, JSON.stringify(items, null, 2), 'utf8');
}

export async function loadArticlesIndex(): Promise<ArticleFileMeta[]> {
    await ensureStructure();

    let raw = '';
    try {
        raw = await fs.readFile(ARTICLES_INDEX, 'utf8');
    } catch {
        // Dosya yoksa/okunmuyorsa sıfırla
        await fs.writeFile(ARTICLES_INDEX, '[]', 'utf8');
        return [];
    }

    const txt = raw.trim();
    if (!txt) return [];

    try {
        // Normal, düzgün JSON ise burası çalışır
        const parsed = JSON.parse(txt);

        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray((parsed as any).items)) {
            return (parsed as any).items;
        }

        return [];
    } catch {
        // Bozuksa dosyayı temizleyip yeniden başla
        await fs.writeFile(ARTICLES_INDEX, '[]', 'utf8');
        return [];
    }
}

export async function saveArticlesIndex(items: ArticleFileMeta[]) {
    await ensureStructure();
    await fs.writeFile(ARTICLES_INDEX, JSON.stringify(items, null, 2), 'utf8');
}

export async function writeArticleBody(slug: string, body: string) {
    await ensureStructure();
    const file = path.join(ARTICLES_DIR, `${slug}.md`);
    await fs.writeFile(file, body ?? '', 'utf8');   
}

export async function readArticleBody(slug: string): Promise<string | null> {
    await ensureStructure();
    const file = path.join(ARTICLES_DIR, `${slug}.md`);
    try { return await fs.readFile(file, 'utf8'); } catch { return null; }
}

export async function deleteArticleFiles(slug: string) {
    const file = path.join(ARTICLES_DIR, `${slug}.md`);
    try { await fs.unlink(file); } catch {}
}
