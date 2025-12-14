import { useState } from "react";

export default function CommentsTest() {
    const [slug, setSlug] = useState("deneme-yazi");
    const [content, setContent] = useState("Merhaba! ilk yorum.");
    const [out, setOut] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function add() {
        setLoading(true);
        try {
            const r = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, content }),
            });
            const payload = await r.json();
            setOut({ step: "POST", status: r.status, ok: r.ok, payload });
        } catch (e: any) {
            setOut({ step: "POST", ok: false, error: String(e) });
        } finally {
            setLoading(false);
        }
    }

    async function load() {
        setLoading(true);
        try {
            const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
            const payload = await r.json();
            setOut({ step: "GET", status: r.status, ok: r.ok, payload });
        } catch (e: any) {
            setOut({ step: "GET", ok: false, error: String(e) });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>COMMENTS TEST</h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug"
                    style={{ padding: 8, minWidth: 260 }}
                />
                <button onClick={load} disabled={loading || !slug.trim()}>
                    Listele (GET)
                </button>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="yorum"
                    style={{ padding: 8, minWidth: 360 }}
                />
                <button onClick={add} disabled={loading || !slug.trim() || !content.trim()}>
                    Yorum gönder (POST)
                </button>
            </div>

            <pre style={{ marginTop: 16 }}>
        {out ? JSON.stringify(out, null, 2) : "Henüz istek atılmadı."}
      </pre>
        </main>
    );
}
