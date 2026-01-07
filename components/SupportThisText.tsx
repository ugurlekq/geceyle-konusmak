// components/SupportThisText.tsx
import React, { useMemo } from "react";

type Props = {
    slug?: string;
    title?: string;
};

const AMOUNTS = [
    { label: " ☕1", amount: 1 },
    { label: " ☕☕ 2", amount: 2 },
    { label: " ☕☕☕ 3", amount: 3 },
];

function safeBuildUrl(baseRaw: string, params: Record<string, string | undefined>) {
    const base = (baseRaw || "").trim();
    if (!base) return null;

    // Protokol yoksa ekle
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

export default function SupportThisText({ slug, title }: Props) {
    const base = (process.env.NEXT_PUBLIC_BMC_URL || "").trim();

    // base yoksa hiç render etmeyelim
    if (!base) return null;

    const links = useMemo(() => {
        return AMOUNTS.map((x) => {
            const href =
                safeBuildUrl(base, {
                    utm_content: slug,
                    utm_term: title,
                    utm_medium: "support",
                    utm_campaign: "article",
                    utm_amount: String(x.amount),
                }) || base;

            return { ...x, href };
        });
    }, [base, slug, title]);

    return (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-white/85 font-semibold">
                Bu metin sende bir yerde karşılık bulduysa,
            </div>

            <div className="mt-1 text-white/70 text-sm">
                emeğe küçük bir destek bırakabilirsin.{" "}
                <span className="text-white/55">Teşekkürler.</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {links.map((x) => (
                    <a
                        key={x.amount}
                        href={x.href}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition text-white/85 text-sm"
                        title="Buy Me a Coffee sayfasında para birimi otomatik seçilir."
                    >
                         {x.label}
                    </a>
                ))}
            </div>

            <div className="mt-2 text-[12px] text-white/45">
                Ödeme Buy Me a Coffee üzerinden <span className="text-white/60">USD</span> olarak alınır.
            </div>
        </div>
    );
}
