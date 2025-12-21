// /lib/adminStore.ts
import type { Issue, Article } from "@/types";

const K_ISSUES = "GK_ISSUES";
const K_ARTS = "GK_ARTICLES";

function readJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function writeJSON<T>(key: string, val: T) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch {}
}

/* ---------------- Issues ---------------- */

export function getIssues(): Issue[] {
    const items = readJSON<Issue[]>(K_ISSUES, []);
    return Array.isArray(items) ? items : [];
}

/** number'a göre upsert */
export function saveIssue(i: Issue) {
    const list = getIssues();
    const idx = list.findIndex((x) => Number(x.number) === Number(i.number));
    if (idx >= 0) list[idx] = i;
    else list.push(i);
    writeJSON(K_ISSUES, list);
}

/** number'a göre sil */
export function deleteIssue(number: number) {
    writeJSON(
        K_ISSUES,
        getIssues().filter((x) => Number(x.number) !== Number(number))
    );
}

/* ---------------- Articles ---------------- */

export function getArticles(): Article[] {
    const items = readJSON<Article[]>(K_ARTS, []);
    return Array.isArray(items) ? items : [];
}

/** slug'a göre upsert */
export function saveArticle(a: Article) {
    const list = getArticles();
    const idx = list.findIndex((x) => (x.slug || "") === (a.slug || ""));
    if (idx >= 0) list[idx] = a;
    else list.push(a);
    writeJSON(K_ARTS, list);
}

export function deleteArticle(id: string) {
    writeJSON(K_ARTS, getArticles().filter((x) => x.id !== id));
}

export function cryptoRandom(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return "id-" + Math.random().toString(36).slice(2);
    }
}
