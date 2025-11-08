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
  // NEW: medya alanları
  embedUrl?: string;            // YouTube / Spotify / SoundCloud vb. normal URL
  audioUrl?: string;            // /public/audio/... gibi yerel dosya
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
      "Content folder not found. Tried:\n" + candidates.map(c => " - " + c).join("\n")
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
      // slug: alt klasör yolunu koru, Windows'ta "/" normalize et
      const rel = path.relative(base, full).replace(/\\/g, "/");
      files.push(rel.replace(/\.md$/, "")); // ".md" uzantısını at
    }
  }
  return files;
}

/* ----------------------------- Public Fonksiyonlar ---------------------------- */
export function getArticleSlugs(): string[] {
  // Artık alt klasörleri de kapsıyor
  return walkMarkdownFiles(contentDir);
}

export function getArticle(slug: string): Article {
  // slug alt dizin içerdiği için direkt join edilebilir
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

  };
}

export function getAllArticles(): Article[] {
  const all = getArticleSlugs().map(getArticle);
  // Tarihe göre (varsa) yeni → eski sırala; tarih yoksa en sona at
  return all.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });
}

/* ------------------------------- Ek Yardımcılar ------------------------------ */
// (İstersen) bir author’a göre filtreleyip sıralı döndürür
export function getArticlesByAuthor(authorId: string): Article[] {
  return getAllArticles().filter(a => a.authorId === authorId);
}

// (İstersen) sadece listeleme için hafif meta döndürür
export function getAllArticleMeta(): Array<Pick<Article, "slug" | "title" | "excerpt" | "date" | "authorId">> {
  return getAllArticles().map(a => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? null,
    date: a.date,
    authorId: a.authorId,
  }));
}
