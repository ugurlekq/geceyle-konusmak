// /lib/cms.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type Article = {
  slug: string;                 // ör: "noura/duygularin-hafizasi..."
  title: string;
  html: string;
  date?: string;
  excerpt?: string | null;
  authorId?: string;
  // medya alanları
  embedUrl?: string;
  audioUrl?: string;
  // DERGİ NUMARASI
  issueNumber?: number;
};

/* -------------------- İçerik klasörünü akıllı şekilde çöz -------------------- */
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

const contentDir = resolveContentDir();

/* ------------------------------- Yardımcılar --------------------------------- */
// Dizinleri RECURSIVE gez, tüm .md dosyalarını "content/"e göre relatif yoluyla döndür
function walkMarkdownFiles(dir: string, base: string = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walkMarkdownFiles(full, base));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      const rel = path.relative(base, full).replace(/\\/g, "/");
      files.push(rel.replace(/\.md$/, ""));
    }
  }
  return files;
}

/* ----------------------------- Public Fonksiyonlar ---------------------------- */
export function getArticleSlugs(): string[] {
  return walkMarkdownFiles(contentDir);
}

export function getArticle(slug: string): Article {
  const fullPath = path.join(contentDir, slug + ".md");
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article not found: ${slug}`);
  }

  const file = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(file);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || undefined,
    excerpt: (data.excerpt as string | undefined) ?? null,
    authorId: (data.authorId as string | undefined) ?? undefined,
    html,
    embedUrl: (data.embedUrl as string | undefined) ?? undefined,
    audioUrl: (data.audioUrl as string | undefined) ?? undefined,
    issueNumber:
        typeof data.issueNumber !== "undefined"
            ? Number(data.issueNumber) || undefined
            : undefined,
  };
}

/* ---- JSON meta (content/articles/index.json) oku ---- */
function readArticlesIndex(): any[] {
  const candidates = [
    path.join(contentDir, "articles", "index.json"), // senin kullandığın yer
    path.join(contentDir, "index.json"),             // olası eski konum
  ];

  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn("getAllArticles: index.json okuma hatası:", p, e);
    }
  }
  return [];
}

export function getAllArticles(): Article[] {
  // 1) Tüm markdown yazılarını oku
  const mdSlugs = getArticleSlugs();
  const mdMap = new Map<string, Article>();

  for (const slug of mdSlugs) {
    try {
      mdMap.set(slug, getArticle(slug));
    } catch (e) {
      console.warn("getAllArticles: markdown okunamadı:", slug, e);
    }
  }

  // 2) JSON meta’yı oku
  const metaList = readArticlesIndex();
  const result: Article[] = [];

  for (const meta of metaList) {
    const slug = String(meta.slug);
    const base = mdMap.get(slug); // slug bire bir uyuşuyorsa md ile eşleşir
    if (base) {
      mdMap.delete(slug); // ekleyince tekrar eklemeyelim
    }

    const merged: Article = {
      ...(base ?? {
        slug,
        title: slug,
        html: "", // md yoksa boş body (şimdilik)
      }),
      title: meta.title ?? base?.title ?? slug,
      excerpt:
          typeof meta.excerpt === "string"
              ? meta.excerpt
              : base?.excerpt ?? null,
      authorId: meta.authorId ?? base?.authorId,
      date: meta.date ?? base?.date,
      embedUrl: meta.embedUrl ?? base?.embedUrl,
      audioUrl: meta.audioUrl ?? base?.audioUrl,
      issueNumber:
          typeof meta.issueNumber !== "undefined"
              ? Number(meta.issueNumber) || undefined
              : base?.issueNumber,
    };

    result.push(merged);
  }

  // 3) JSON’da hiç geçmeyen eski md yazıları da ekle (1. sayı vs için güvenlik)
  for (const leftover of mdMap.values()) {
    result.push(leftover);
  }

  // 4) Tarihe göre yeni → eski sırala
  result.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });

  return result;
}

/* ------------------------------- Ek Yardımcılar ------------------------------ */
export function getArticlesByAuthor(authorId: string): Article[] {
  return getAllArticles().filter((a) => a.authorId === authorId);
}

export function getAllArticleMeta(): Array<
    Pick<Article, "slug" | "title" | "excerpt" | "date" | "authorId">
> {
  return getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? null,
    date: a.date,
    authorId: a.authorId,
  }));
}
