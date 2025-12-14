import { useState } from "react";

export default function TestPage() {
    const [out, setOut] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState("test");

    async function sendLike() {
        setLoading(true);
        try {
            const r = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: "deneme-yazi" }),
            });

            const contentType = r.headers.get("content-type") || "";
            const payload = contentType.includes("application/json")
                ? await r.json()
                : await r.text();

            setOut({
                status: r.status,
                ok: r.ok,
                contentType,
                payload,
            });
        } catch (e: any) {
            setOut({ ok: false, error: String(e) });
        } finally {
            setLoading(false);
        }
    }


    return (
        <main style={{ padding: 24 }}>
            <h1>LIKE TEST</h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug (örn: yazinin-slug'i)"
                    style={{ padding: 8, minWidth: 260 }}
                />

                <button onClick={sendLike} disabled={loading || !slug.trim()}>
                    {loading ? "Gönderiliyor..." : "Like gönder"}
                </button>
            </div>

            <pre style={{ marginTop: 16 }}>
        {out ? JSON.stringify(out, null, 2) : "Henüz istek atılmadı."}
      </pre>
        </main>
    );
}
