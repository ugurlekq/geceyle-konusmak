// /lib/cms.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Tekil makale tipi – hem MD'den hem de JSON index'ten beslenir.
 */
export type Article = {
  slug: string;
  title: string;
  html: string;
  date?: string;
  excerpt?: string | null;
  authorId?: string;
  embedUrl?: string | null;
  audioUrl?: string | null;
  issueNumber?: number | null;
};

/**
 * content/articles/index.json içindeki satırlar.
 * Bu dosya başlık, embedUrl, issueNumber vb. meta bilgisini tutuyor.
 */
type ArticleIndexEntry = {
  id?: string;
  issueNumber?: number | null;
  title?: string;
  slug?: string;
  authorId?: string;
  date?: string;
  excerpt?: string;
  embedUrl?: string;
  audioUrl?: string;
};

/* ----------------------------------------------------
 * Yardımcılar – içerik klasörünü ve .md dosyalarını bul
 * -------------------------------------------------- */

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


/** Verilen dizin altındaki tüm .md dosyalarının relatif yol listesini döndür. */
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

/** İçerikteki tüm relatif slug'lar (ör: "iyilesmek", "arin-kael/sinirin-icindeki-sonsuzluk") */
function getAllRelSlugs(): string[] {
  const contentDir = resolveContentDir();
  return walkMarkdownFiles(contentDir);
}

/**
 * URL'de kullandığımız slug'ı gerçek .md yoluna çevir.
 * Ör: "iyilesmek" → "iyilesmek" ya da "arin-kael/iyilesmek"
 */
function resolveFileSlug(slug: string): string | null {
  const all = getAllRelSlugs();

  // 1) Tam eşleşme
  if (all.includes(slug)) return slug;

  const last = slug.split("/").pop() || slug;

  // 2) Sadece dosya adına göre eşleşme
  const found =
      all.find((rel) => rel === last) ||
      all.find((rel) => rel.endsWith("/" + last));

  return found ?? null;
}

/* ----------------------------------------------------
 * JSON index (content/articles/index.json)
 * -------------------------------------------------- */

let cachedIndex: ArticleIndexEntry[] | null = null;

function readArticleIndex(): ArticleIndexEntry[] {
  if (cachedIndex) return cachedIndex;

  try {
    const p = path.join(process.cwd(), "content", "articles", "index.json");
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      cachedIndex = parsed as ArticleIndexEntry[];
    } else if (Array.isArray((parsed as any).items)) {
      cachedIndex = (parsed as any).items as ArticleIndexEntry[];
    } else {
      cachedIndex = [];
    }
  } catch {
    cachedIndex = [];
  }

  return cachedIndex;
}

/** index.json içinden slug'a göre meta bul – küçük/büyük harfe duyarsız. */
function findIndexMeta(slug: string): ArticleIndexEntry | undefined {
  const list = readArticleIndex();
  if (!slug) return undefined;

  const lowerSlug = slug.toLowerCase();
  const last = slug.split("/").pop()?.toLowerCase() ?? lowerSlug;

  return (
      list.find((e) => e.slug && e.slug.toLowerCase() === lowerSlug) ??
      list.find((e) => e.slug && e.slug.toLowerCase() === last)
  );
}

/* ----------------------------------------------------
 * Public API
 * -------------------------------------------------- */

/**
 * Statik yol üretimi için kullanılacak tüm slug'lar.
 * - Önce index.json'dakiler
 * - Sonra ekstra .md dosyaları
 */
export function getArticleSlugs(): string[] {
  const mdSlugs = getAllRelSlugs();
  const indexSlugs = readArticleIndex()
      .map((a) => a.slug)
      .filter((s): s is string => !!s);

  const set = new Set<string>();

  // URL'lerde index.json'daki slug'ları kullanıyoruz (ör: "iyilesmek")
  for (const s of indexSlugs) set.add(s);

  // Index'te olmayan ekstra .md dosyaları da erişilebilir olsun
  for (const s of mdSlugs) set.add(s);

  return Array.from(set);
}

/**
 * Tek bir makaleyi oku:
 * - Gövde: her zaman .md dosyasından
 * - Meta: önce MD front-matter → sonra index.json
 *
 * Böylece:
 * - Eski statik yazılarda front-matter'daki embedUrl kullanılır.
 * - Admin panelden gelen yeni yazılarda (sadece .md gövde + index.json meta)
 *   index.json'daki embedUrl, title, issueNumber vb. devreye girer.
 */
export function getArticle(slug: string): Article {
  const contentDir = resolveContentDir();

  const fileSlug = resolveFileSlug(slug);
  const meta = findIndexMeta(slug);

  let fm: any = {};
  let mdHtml = "";

  if (fileSlug) {
    const fullPath = path.join(contentDir, fileSlug + ".md");
    const file = fs.readFileSync(fullPath, "utf-8");
    const parsed = matter(file);
    fm = parsed.data || {};
    mdHtml = marked.parse(parsed.content) as string;
  }

  if (!fileSlug && !meta) {
    throw new Error(`Article not found for slug: ${slug}`);
  }

  const html = mdHtml;

  const title: string =
      (fm.title as string | undefined) ??
      (meta?.title as string | undefined) ??
      slug;

  const date: string | undefined =
      (fm.date as string | undefined) ??
      (meta?.date as string | undefined);

  const excerpt: string | null =
      (fm.excerpt as string | undefined) ??
      (meta?.excerpt as string | undefined) ??
      null;

  const authorId: string | undefined =
      (fm.authorId as string | undefined) ??
      (meta?.authorId as string | undefined) ??
      undefined;

  const embedUrl: string | null =
      (fm.embedUrl as string | undefined) ??
      (meta?.embedUrl as string | undefined) ??
      null;

  const audioUrl: string | null =
      (fm.audioUrl as string | undefined) ??
      (meta?.audioUrl as string | undefined) ??
      null;

  // issueNumber hem index.json hem front-matter'da string/number olabilir
  const rawIssue =
      typeof fm.issueNumber !== "undefined"
          ? fm.issueNumber
          : typeof meta?.issueNumber !== "undefined"
              ? meta.issueNumber
              : undefined;

  const issueNumber =
      typeof rawIssue !== "undefined" ? Number(rawIssue) || null : null;

  const finalSlug =
      (meta?.slug as string | undefined) ?? fileSlug ?? slug;

  return {
    slug: finalSlug,
    title,
    html,
    date,
    excerpt,
    authorId,
    embedUrl,
    audioUrl,
    issueNumber,
  };
}

/**
 * Tüm makaleleri oku ve tarihe göre (yeni → eski) sırala.
 */
export function getAllArticles(): Article[] {
  const allSlugs = getArticleSlugs();

  const all = allSlugs
      .map((s) => {
        try {
          return getArticle(s);
        } catch {
          return null;
        }
      })
      .filter((a): a is Article => a !== null);

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
