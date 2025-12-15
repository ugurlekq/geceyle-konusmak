// /types.ts
export type Issue = {
    id: string;
    number: number;        // 1, 2, ...
    title: string;
    date: string;          // "2025-11-11"
    description?: string;
    coverUrl?: string;
};

export type Article = {
    id: string;            // uuid/crypto
    slug: string;          // "makul-modern-insan"
    title: string;
    excerpt?: string | null;
    body?: string;         // opsiyonel düz metin (Admin paneli)
    html?: string;         // opsiyonel render edilmis icerik (CMS)
    date: string;          // "2025-11-11"
    authorId: string;      // authors.ts'deki id
    issueNumber: number;   // ZORUNLU — 1/2/3…
    embedUrl?: string | null;
    audioUrl?: string | null;
};

// types.ts
export type UserSession = {
    email: string;
    name?: string | null;
    role?: string;
    isSubscribed?: boolean;
};

