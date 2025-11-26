// /lib/adminStore.ts
import type { Issue, Article } from "@/types";

const K_ISSUES = "GK_ISSUES";
const K_ARTS   = "GK_ARTICLES";

function readJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
    } catch { return fallback; }
}

function writeJSON<T>(key: string, val: T) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/** Eksik / hatalı alanları düzelt (eski veriler için göç) */
function migrateArticles(list: any[]): Article[] {
    return list.map((a: any) => {
        const issueNumber = Number(a.issueNumber ?? a.issue ?? 1) || 1;
        const date = a.date || new Date().toISOString().slice(0,10);
        const authorId = (a.authorId || "").toString().trim() || "unknown";
        return {
            id: a.id || cryptoRandom(),
            slug: (a.slug || "").toString(),
            title: (a.title || "").toString(),
            excerpt: a.excerpt ?? null,
            body: a.body,
            html: a.html,
            date,
            authorId,
            issueNumber,
            embedUrl: a.embedUrl ?? null,
            audioUrl: a.audioUrl ?? null,
        } as Article;
    }).filter(x => x.slug && x.title);
}

export function getIssues(): Issue[] {
    return readJSON<Issue[]>(K_ISSUES, []);
}

export function saveIssue(i: Issue) {
    const list = getIssues();
    const idx = list.findIndex(x => x.id === i.id);
    if (idx >= 0) list[idx] = i; else list.push(i);
    writeJSON(K_ISSUES, list);
}

export function deleteIssue(id: string) {
    writeJSON(K_ISSUES, getIssues().filter(x => x.id !== id));
}

export function getArticles(): Article[] {
    const list = readJSON<any[]>(K_ARTS, []);
    const migrated = migrateArticles(list);
    // slug uniq
    const uniq = Array.from(new Map(migrated.map(a => [a.slug, a])).values());
    return uniq;
}

export function saveArticle(a: Article) {
    const list = getArticles();
    // normalize
    a.issueNumber = Number(a.issueNumber) || 1;
    a.date = a.date || new Date().toISOString().slice(0,10);
    a.authorId = (a.authorId || "").trim() || "unknown";
    const idx = list.findIndex(x => x.slug === a.slug);
    if (idx >= 0) list[idx] = a; else list.push(a);
    writeJSON(K_ARTS, list);
}

export function deleteArticle(id: string) {
    writeJSON(K_ARTS, getArticles().filter(x => x.id !== id));
}

export function cryptoRandom(): string {
    try { return crypto.randomUUID(); } catch {
        return "id-" + Math.random().toString(36).slice(2);
    }
}
