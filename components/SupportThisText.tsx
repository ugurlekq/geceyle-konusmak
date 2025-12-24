// components/SupportThisText.tsx
import React, { useMemo } from "react";

type Props = {
    slug?: string;
    title?: string;
};

const AMOUNTS = [
    { label: "☕ 10 TL", amount: 10 },
    { label: "☕☕ 25 TL", amount: 25 },
    { label: "☕☕☕ 50 TL", amount: 50 },
];

function safeBuildUrl(base: string, params: Record<string, string | undefined>) {
    if (!base) return null;

    // "buymeacoffee.com/xxx" yazılırsa https ekle
    const normalized =
        base.startsWith("http://") || base.startsWith("https://")
            ? base
            : `https://${base}`;

    try {
        const u = new URL(normalized);

        // UTM'ler
        Object.entries(params).forEach(([k, v]) => {
            if (v) u.searchParams.set(k, v);
        });

        return u.toString();
    } catch {
        return null;
    }
}

export default function SupportThisText({ slug, title }: Props) {
    // ✅ SSR-safe: env yoksa "" döner → component hiç render olmaz
    const base = process.env.NEXT_PUBLIC_BMC_URL?.trim() || "";

    // ✅ base absolute değilse bile safeBuildUrl normalize ediyor
    const links = useMemo(() => {
        if (!base) return [];

        return AMOUNTS.map((x) => {
            const href =
                safeBuildUrl(base, {
                    utm_source: "geceyle-konusmak",
                    utm_medium: "support",
                    utm_campaign: "article",
                    utm_content: slug,
                    utm_term: title,
                    utm_amount: String(x.amount),
                }) || safeBuildUrl(base, {}) || null;

            return { ...x, href };
        }).filter((x) => !!x.href) as Array<{ label: string; amount: number; href: string }>;
    }, [base, slug, title]);

    // ✅ base yoksa hiç gösterme
    if (!base || links.length === 0) return null;

    return (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-white/85 font-semibold">
                Bu yazı sende bir yerde karşılık bulduysa…
            </div>
            <div className="mt-1 text-white/60 text-sm">
                Küçük bir destek bırakabilirsin. Bu bir zorunluluk değil.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {links.map((x) => (
                    <a
                        key={x.amount}
                        href={x.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition text-white/85 text-sm"
                    >
                        {x.label}
                    </a>
                ))}
            </div>
        </div>
    );
}
