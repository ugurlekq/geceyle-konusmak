// /lib/cms.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type Article = {
  slug: string;                 // Ör: "arin-kael/articles/zihnin-arka-plani"
  title: string;
  html: string;
  date?: string;
  excerpt?: string | null;
  authorId?: string;
  embedUrl?: string;
  audioUrl?: string;
  issueNumber?: number | null;
};

/* -------------------- İçerik klasörünü bul -------------------- */

function resolveContentDir(): string {
  const candidates = [
    path.join(process.cwd(), "content"),
    path.join(process.cwd(), "src", "content"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
      "Content folder not found. Tried:\n" +
      candidates.map((c) => " - " + c).join("\n")
  );
}

/* -------------------- Markdown dosyalarını tara -------------------- */

function walkMarkdownFiles(dir: string, base: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walkMarkdownFiles(full, base));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      const rel = path.relative(base, full).replace(/\\/g, "/");
      files.push(rel.replace(/\.md$/, "")); // ".md" uzantısını at
    }
  }
  return files;
}

function getAllRelSlugs(): string[] {
  const contentDir = resolveContentDir();
  return walkMarkdownFiles(contentDir);
}

/**
 * Verilen slug için dosya yolunu bul:
 *  - Önce tam eşleşme ("arin-kael/articles/iyilesmek")
 *  - Sonra sadece son parçaya göre ("iyilesmek")
 */
function resolveFileSlug(slug: string): string {
  const all = getAllRelSlugs();

  // 1) Tam eşleşme
  if (all.includes(slug)) return slug;

  const last = slug.split("/").pop() || slug;

  // 2) Sadece dosya adına göre eşleşme
  const found =
      all.find((rel) => rel === last) ||
      all.find((rel) => rel.endsWith("/" + last));

  if (!found) {
    throw new Error(`Article not found for slug: ${slug}`);
  }
  return found;
}

/* -------------------------- Public API -------------------------- */

export function getArticleSlugs(): string[] {
  return getAllRelSlugs();
}

export function getArticle(slug: string): Article {
  const contentDir = resolveContentDir();
  const fileSlug = resolveFileSlug(slug);

  const fullPath = path.join(contentDir, fileSlug + ".md");
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article not found at path: ${fullPath}`);
  }

  const file = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(file);
  const html = marked.parse(content) as string;

  return {
    slug: fileSlug,
    title: (data.title as string) || fileSlug,
    date: (data.date as string) || undefined,
    excerpt: (data.excerpt as string | undefined) ?? null,
    authorId: (data.authorId as string | undefined) ?? undefined,
    html,
    embedUrl: (data.embedUrl as string | undefined) ?? undefined,
    audioUrl: (data.audioUrl as string | undefined) ?? undefined,
    issueNumber:
        typeof data.issueNumber !== "undefined"
            ? Number(data.issueNumber) || null
            : null,
  };
}

export function getAllArticles(): Article[] {
  const all = getArticleSlugs().map(getArticle);
  return all.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });
}

export function getArticlesByAuthor(authorId: string): Article[] {
  return getAllArticles().filter((a) => a.authorId === authorId);
}

export function getAllArticleMeta(): Array<
    Pick<Article, "slug" | "title" | "excerpt" | "date" | "authorId" | "issueNumber">
> {
  return getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? null,
    date: a.date,
    authorId: a.authorId,
    issueNumber: a.issueNumber ?? null,
  }));
}
