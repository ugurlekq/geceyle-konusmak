import { useEffect, useMemo, useState, type SVGProps } from "react";

type ArticleShareProps = {
    title: string;
    summary?: string;
    url?: string;
    className?: string;
};

type ShareItem = {
    name: string;
    buildHref: (resolvedUrl: string, encodedTitle: string, shareText: string) => string;
    icon: React.ReactNode;
};

function XIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.78-6.26L6.64 22H3.53l7.24-8.27L1 2h6.25l4.32 5.71L18.9 2Zm-1.07 18h1.69L6.33 3.9H4.51L17.83 20Z" />
        </svg>
    );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.4V11H7.5v3h2.7v8h3.3Z" />
        </svg>
    );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .15 5.34.15 11.91c0 2.1.55 4.16 1.6 5.97L0 24l6.31-1.65a11.88 11.88 0 0 0 5.75 1.47h.01c6.56 0 11.91-5.35 11.91-11.91 0-3.18-1.24-6.16-3.46-8.43ZM12.07 21.8h-.01a9.89 9.89 0 0 1-5.04-1.38l-.36-.21-3.75.98 1-3.66-.23-.38a9.88 9.88 0 0 1-1.52-5.24c0-5.45 4.44-9.89 9.91-9.89 2.64 0 5.13 1.02 6.99 2.88a9.82 9.82 0 0 1 2.9 7 9.9 9.9 0 0 1-9.89 9.9Zm5.42-7.39c-.3-.15-1.77-.87-2.05-.96-.28-.1-.48-.15-.68.14-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.1 9.1 0 0 1-1.68-2.08c-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.65-.93-2.25-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.29.5 1.73.63.73.23 1.39.2 1.91.12.58-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
    );
}

function TelegramIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M21.94 4.66c.32-1.2-.45-1.67-1.47-1.3L2.73 10.2c-1.18.46-1.17 1.12-.2 1.42l4.56 1.42 10.56-6.66c.5-.3.96-.14.58.2l-8.55 7.72-.33 4.94c.49 0 .7-.23.98-.5l2.37-2.3 4.93 3.64c.91.5 1.57.24 1.8-.84l2.5-14.58Z" />
        </svg>
    );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 7.05c1.08 0 1.75-.72 1.75-1.61-.02-.91-.67-1.6-1.73-1.6-1.07 0-1.76.69-1.76 1.6 0 .9.67 1.61 1.72 1.61h.02ZM20.44 20h-3.38v-6.15c0-1.54-.55-2.58-1.92-2.58-1.05 0-1.67.71-1.95 1.39-.1.25-.13.6-.13.95V20h-3.38s.04-10.42 0-11.5h3.38v1.63c.45-.69 1.25-1.67 3.05-1.67 2.22 0 3.89 1.45 3.89 4.58V20Z" />
        </svg>
    );
}

function RedditIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M14.25 13.53c-.5 0-.91.4-.91.9 0 .5.41.9.91.9.5 0 .9-.4.9-.9a.9.9 0 0 0-.9-.9Zm-4.5 0c-.5 0-.9.4-.9.9 0 .5.4.9.9.9.5 0 .91-.4.91-.9a.9.9 0 0 0-.9-.9Zm8.6-2.09c-.68 0-1.27.28-1.68.73-1.17-.8-2.73-1.32-4.47-1.38l.95-2.98 2.58.61a1.53 1.53 0 1 0 .2-.86l-3.08-.73a.45.45 0 0 0-.54.3l-1.08 3.42c-1.82.03-3.46.55-4.67 1.37a2.27 2.27 0 0 0-1.62-.68c-1.25 0-2.27 1.02-2.27 2.27 0 .92.55 1.7 1.34 2.05-.03.2-.05.41-.05.61 0 3.12 3.58 5.65 8 5.65s8-2.53 8-5.65c0-.19-.01-.38-.04-.57a2.28 2.28 0 0 0 1.55-2.16 2.27 2.27 0 0 0-2.27-2.27Zm-6.24 8.24c-2.03 0-3.82-.94-4.47-2.23a.37.37 0 0 1 .66-.33c.53 1.04 2.04 1.8 3.81 1.8 1.76 0 3.27-.76 3.8-1.8a.38.38 0 0 1 .67.33c-.65 1.29-2.44 2.23-4.47 2.23Z" />
        </svg>
    );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

function ShareIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <path d="M7 12v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6" />
            <path d="M12 16V4" />
            <path d="m8 8 4-4 4 4" />
        </svg>
    );
}

function CopyIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
            <rect x="9" y="9" width="10" height="10" rx="2" />
            <path d="M5 15V7a2 2 0 0 1 2-2h8" />
        </svg>
    );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
            <path d="M5 12.5 9.5 17 19 7.5" />
        </svg>
    );
}

export default function ArticleShare({
                                         title,
                                         summary = "",
                                         url = "",
                                         className = "",
                                     }: ArticleShareProps) {
    const [resolvedUrl, setResolvedUrl] = useState("");
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (url) {
            setResolvedUrl(url);
        } else if (typeof window !== "undefined") {
            setResolvedUrl(window.location.href);
        }

        if (typeof navigator !== "undefined" && "share" in navigator) {
            setCanNativeShare(true);
        }
    }, [url]);

    const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);

    const shareText = useMemo(() => {
        return `${title}${summary ? ` — ${summary}` : ""}`;
    }, [title, summary]);

    const shareItems: ShareItem[] = [
        {
            name: "X",
            buildHref: (shareUrl, shareTitle) =>
                `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`,
            icon: <XIcon className="h-4 w-4" />,
        },
        {
            name: "Facebook",
            buildHref: (shareUrl) =>
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            icon: <FacebookIcon className="h-4 w-4" />,
        },
        {
            name: "WhatsApp",
            buildHref: (shareUrl, _shareTitle, fullShareText) =>
                `https://api.whatsapp.com/send?text=${encodeURIComponent(`${fullShareText} ${shareUrl}`)}`,
            icon: <WhatsAppIcon className="h-4 w-4" />,
        },
        {
            name: "Telegram",
            buildHref: (shareUrl, shareTitle) =>
                `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
            icon: <TelegramIcon className="h-4 w-4" />,
        },
        {
            name: "LinkedIn",
            buildHref: (shareUrl) =>
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            icon: <LinkedInIcon className="h-4 w-4" />,
        },
        {
            name: "Reddit",
            buildHref: (shareUrl, shareTitle) =>
                `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${shareTitle}`,
            icon: <RedditIcon className="h-4 w-4" />,
        },
        {
            name: "Mail",
            buildHref: (shareUrl, shareTitle, fullShareText) =>
                `mailto:?subject=${shareTitle}&body=${encodeURIComponent(`${fullShareText}\n\n${shareUrl}`)}`,
            icon: <MailIcon className="h-4 w-4" />,
        },
    ];

    const openShareWindow = (href: string) => {
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const handlePlatformShare = (item: ShareItem) => {
        if (!resolvedUrl) return;

        const href = item.buildHref(resolvedUrl, encodedTitle, shareText);
        openShareWindow(href);
    };

    const handleCopy = async () => {
        if (!resolvedUrl) return;

        try {
            if (typeof navigator !== "undefined" && navigator.clipboard) {
                await navigator.clipboard.writeText(resolvedUrl);
                setCopied(true);

                window.setTimeout(() => {
                    setCopied(false);
                }, 1800);
            } else {
                alert("Bu tarayıcıda kopyalama desteklenmiyor.");
            }
        } catch (error) {
            console.error("Bağlantı kopyalanamadı:", error);
            alert("Bağlantı kopyalanamadı.");
        }
    };

    const handleNativeShare = async () => {
        if (!resolvedUrl) return;

        try {
            if (typeof navigator !== "undefined" && "share" in navigator) {
                await navigator.share({
                    title,
                    text: summary || title,
                    url: resolvedUrl,
                });
            }
        } catch (error) {
            console.error("Paylaşım iptal edildi veya başarısız oldu:", error);
        }
    };

    return (
        <section
            aria-label="Yazıyı paylaş"
            className={`mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm ${className}`}
        >
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-3xl font-semibold tracking-tight text-[#d4a949]">
                        Paylaş
                    </h3>
                    <p className="mt-2 text-sm text-white/45">
                        Yazıyı dilediğin platformda paylaş.
                    </p>
                </div>

                {canNativeShare && resolvedUrl ? (
                    <button
                        type="button"
                        onClick={handleNativeShare}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-white/90 transition hover:border-white/20 hover:bg-white/[0.07]"
                    >
                        <ShareIcon className="h-4 w-4" />
                        <span>Cihazda Paylaş</span>
                    </button>
                ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
                {shareItems.map((item) => (
                    <button
                        key={item.name}
                        type="button"
                        onClick={() => handlePlatformShare(item)}
                        disabled={!resolvedUrl}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 transition ${
                            resolvedUrl
                                ? "border-white/10 bg-white/[0.04] text-white/85 hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                                : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30"
                        }`}
                    >
                        <span className="text-white/80">{item.icon}</span>
                        <span>{item.name}</span>
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!resolvedUrl}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 transition ${
                        resolvedUrl
                            ? "border-[#d4a949]/25 bg-[#d4a949]/10 text-[#f1d58d] hover:-translate-y-[1px] hover:border-[#d4a949]/40 hover:bg-[#d4a949]/15"
                            : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30"
                    }`}
                >
                    {copied ? (
                        <>
                            <CheckIcon className="h-4 w-4" />
                            <span>Kopyalandı</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="h-4 w-4" />
                            <span>Linki Kopyala</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}