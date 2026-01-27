import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });
import Captions from "yet-another-react-lightbox/plugins/captions";

type ManifestItem =
    | string
    | {
    file: string;
    caption?: string;
    title?: string;
};

type Props = {
    issueLabel: string; // "04"
    title?: string;
    subtitle?: string;
    /** Filmstrip üzerinde isim gösterilsin mi? default: false */
    showNamesOnStrip?: boolean;
};

export default function IssueAlbum({
                                       issueLabel,
                                       title,
                                       subtitle,
                                       showNamesOnStrip = false,
                                   }: Props) {
    const [items, setItems] = useState<{ file: string; caption?: string; title?: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const r = await fetch(`/images/issues/album/${issueLabel}/manifest.json`, {
                    cache: "no-store",
                });
                const j = await r.json();
                const raw = Array.isArray(j?.images) ? (j.images as ManifestItem[]) : [];

                const normalized = raw
                    .map((it) => {
                        if (typeof it === "string") return { file: it };
                        if (it && typeof it.file === "string") return { file: it.file, caption: it.caption, title: it.title };
                        return null;
                    })
                    .filter(Boolean) as { file: string; caption?: string; title?: string }[];

                if (!cancelled) setItems(normalized);
            } catch {
                if (!cancelled) setItems([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [issueLabel]);

    const slides = useMemo(() => {
        return items.map((it) => ({
            src: `/images/issues/album/${issueLabel}/${it.file}`,
            // Captions plugin bunları okur:
            title: it.title ?? "",
            description: it.caption ?? "",
        }));
    }, [items, issueLabel]);

    if (!items.length) return null;

    return (
        <section className="mt-7 mb-2 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-black/30">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm text-amber-200/90 font-medium">Bu sayının fotoğraf albümü</div>
                        <div className="text-xs text-white/55 truncate">
                            {title ? title : `Sayı ${issueLabel}`} • {items.length} kare
                            {subtitle ? ` • ${subtitle}` : ""}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIndex(0);
                            setOpen(true);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-black/55 text-xs text-white/75 transition"
                    >
                        Albümü aç
                    </button>
                </div>
            </div>

            {/* Filmstrip */}
            <div className="px-4 py-4">
                <div className="gk-scroll flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {items.map((it, i) => {
                        const src = `/images/issues/album/${issueLabel}/${it.file}`;
                        const caption = it.caption ?? "";

                        return (
                            <button
                                key={src}
                                onClick={() => {
                                    setIndex(i);
                                    setOpen(true);
                                }}
                                className="snap-start shrink-0 relative h-24 w-36 md:h-28 md:w-44 rounded-xl overflow-hidden border border-white/10 bg-black/40 hover:border-amber-300/30 transition"
                                aria-label={`Albüm görseli ${i + 1}`}
                                // hover tooltip yerine caption gösterebiliriz:
                                title={caption || ""}
                                style={{ boxShadow: "0 0 18px rgba(251,191,36,.10)" }}
                            >
                                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

                                {/* İsimleri ister gizle ister aç */}
                                {showNamesOnStrip ? (
                                    <div className="absolute bottom-1.5 left-2 right-2 text-[0.68rem] text-white/70 bg-black/40 border border-white/10 rounded-full px-2 py-0.5 truncate">
                                        {it.file}
                                    </div>
                                ) : null}

                                {/* Çok minimal numara (istersen tamamen kaldırırız) */}
                                <div className="absolute bottom-1.5 right-2 text-[0.65rem] text-white/55 bg-black/35 border border-white/10 rounded-full px-2 py-0.5">
                                    {i + 1}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox + Captions */}
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                slides={slides}
                plugins={[Captions]}
                controller={{ closeOnBackdropClick: true }}
                carousel={{ finite: false }}
                styles={{
                    container: { backgroundColor: "rgba(0,0,0,0.92)" },
                }}
            />

        </section>
    );
}
