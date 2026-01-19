// components/SupportThisText.tsx
import React, { useEffect, useMemo, useState } from "react";

type Props = {
    slug?: string;
    title?: string;
    anchorId?: string; // ✅
};

const AMOUNTS = [
    { label: " ☕1", amount: 1 },
    { label: " ☕☕ 2", amount: 2 },
    { label: " ☕☕☕ 3", amount: 3 },
];

function safeBuildUrl(baseRaw: string, params: Record<string, string | undefined>) {
    const base = (baseRaw || "").trim();
    if (!base) return null;

    const normalized =
        base.startsWith("http://") || base.startsWith("https://") ? base : `https://${base}`;

    try {
        const u = new URL(normalized);
        Object.entries(params).forEach(([k, v]) => {
            if (v) u.searchParams.set(k, v);
        });
        return u.toString();
    } catch {
        return null;
    }
}

export default function SupportThisText({ slug, title, anchorId }: Props) {
    const base = (process.env.NEXT_PUBLIC_BMC_URL || "").trim();
    if (!base) return null;

    const [flash, setFlash] = useState(false);

    // ✅ flash tetikleyici (hash veya custom event)
    useEffect(() => {
        if (!anchorId) return;

        let t: any = null;

        const trigger = () => {
            setFlash(false); // tekrar tetik için reset
            requestAnimationFrame(() => setFlash(true));
            if (t) clearTimeout(t);
            t = setTimeout(() => setFlash(false), 1200);
        };

        const onHash = () => {
            if (window.location.hash === `#${anchorId}`) trigger();
        };

        const onCustom = (e: any) => {
            if (e?.detail?.id === anchorId) trigger();
        };

        // sayfa hash ile açıldıysa da çalışsın
        onHash();

        window.addEventListener("hashchange", onHash);
        window.addEventListener("gk:flash-support", onCustom);

        return () => {
            window.removeEventListener("hashchange", onHash);
            window.removeEventListener("gk:flash-support", onCustom);
            if (t) clearTimeout(t);
        };
    }, [anchorId]);

    const links = useMemo(() => {
        return AMOUNTS.map((x) => {
            const href =
                safeBuildUrl(base, {
                    utm_content: slug || "issue",
                    utm_term: title || "Geceyle Konuşmak",
                    utm_medium: "support",
                    utm_campaign: "issue",
                    utm_amount: String(x.amount),
                }) || base;

            return { ...x, href };
        });
    }, [base, slug, title]);

    return (
        <div
            id={anchorId}
            className={[
                "mt-12 scroll-mt-28 relative overflow-hidden rounded-2xl border border-amber-400/20",
                "bg-gradient-to-b from-amber-400/10 via-white/5 to-transparent p-6",
                "transition-shadow",
                flash ? "shadow-[0_0_0_2px_rgba(251,191,36,0.35),0_0_28px_rgba(251,191,36,0.18)]" : "",
            ].join(" ")}
        >
            {/* ✅ flash overlay (border pulse) */}
            {flash && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-amber-300/60 animate-pulse" />
            )}

            {/* sol accent çizgi */}
            <div className="absolute left-0 top-0 h-full w-1 bg-amber-400/50" />

            {/* küçük etiket */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                ☕ Destek
            </div>

            {/* başlık */}
            <div className="mt-3 text-lg md:text-xl text-white/90 font-semibold">
                Bu sayı sende bir yerde karşılık bulduysa,
            </div>

            {/* ana metin + teşekkür */}
            <div className="mt-1 text-white/70 text-sm md:text-[15px]">
                emeğe küçük bir destek bırakabilirsin. <span className="text-white/55">Teşekkürler.</span>
            </div>

            {/* neden satırı */}
            <div className="mt-3 text-white/55 text-sm">
                Her destek, bir sonraki sayının yolunu biraz daha açar.
            </div>

            {/* butonlar */}
            <div className="mt-5 flex flex-wrap gap-2">
                {links.map((x) => (
                    <a
                        key={x.amount}
                        href={x.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group px-4 py-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/15 transition text-amber-200 text-sm"
                        title="Buy Me a Coffee sayfasında para birimi otomatik seçilir."
                    >
            <span className="inline-block transition-transform group-hover:-translate-y-0.5">
              {x.label}
            </span>
                    </a>
                ))}
            </div>

            <div className="mt-3 text-[12px] text-white/45">
                Ödeme Buy Me a Coffee üzerinden <span className="text-white/60">USD</span> olarak alınır.
            </div>
        </div>
    );
}
