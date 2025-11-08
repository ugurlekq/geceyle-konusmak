'use client';
import { useEffect, useRef } from 'react';

type Props = {
    videoId: string;          // ör: "7DkIKFGJh14"
    start?: number;           // saniye
    end?: number;             // saniye — buna geldiğinde başa sar
    opacity?: number;         // 0..1
    blur?: string;            // "blur-sm", "blur-[1px]"...
    playing?: boolean;        // dışarıdan play/pause kontrolü
    className?: string;       // ekstra sınıflar
    muted?: boolean;          // autoplay için varsayılan true
    onFirstPlay?: () => void; // video ilk kez PLAYING olduğunda çağrılır
};

declare global {
    interface Window {
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

export default function BackgroundYouTube({
                                              videoId,
                                              start = 0,
                                              end = 240,                 // ör: 4:00
                                              opacity = 0.35,
                                              blur = 'blur-sm',
                                              playing = false,
                                              className = '',
                                              muted = true,
                                              onFirstPlay,
                                          }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const tickerRef = useRef<number | null>(null);
    const firedRef = useRef(false); // ✅ onFirstPlay sadece 1 kez

    // API'yi yükle + player'ı oluştur
    useEffect(() => {
        const ensureApi = () =>
            new Promise<void>((resolve) => {
                if (window.YT && window.YT.Player) return resolve();
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
                window.onYouTubeIframeAPIReady = () => resolve();
            });

        const create = async () => {
            await ensureApi();
            if (!wrapperRef.current) return;

            // varsa eski içeriği temizle
            wrapperRef.current.innerHTML = '';

            // player'ı bağlayacağımız iç div
            const host = document.createElement('div');
            host.style.width = '100%';
            host.style.height = '100%';
            wrapperRef.current.appendChild(host);

            playerRef.current = new window.YT.Player(host, {
                videoId,
                playerVars: {
                    autoplay: 1,         // 🔁 sessiz autoplay
                    controls: 0,         // arka plan — buton yok
                    disablekb: 1,
                    fs: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    start,
                },
                events: {
                    onReady: (e: any) => {
                        try {
                            // autoplay politikası için sessiz başlat
                            if (muted) e.target.mute(); else e.target.unMute();
                            e.target.seekTo(start, true);
                            e.target.playVideo(); // sessizce başlar
                        } catch {}

                        // segment döngüsü (start..end)
                        if (end != null) {
                            tickerRef.current = window.setInterval(() => {
                                try {
                                    const t = e.target.getCurrentTime?.() ?? 0;
                                    if (t >= end - 0.2) e.target.seekTo(start, true);
                                } catch {}
                            }, 250);
                        }
                    },
                    onStateChange: (ev: any) => {
                        // ilk kez PLAYING'e geçtiğinde haber ver
                        if (ev.data === window.YT.PlayerState.PLAYING && !firedRef.current) {
                            firedRef.current = true;
                            onFirstPlay?.();
                        }
                        // güvenlik: ENDED gelirse başa sar ve devam et
                        if (ev.data === window.YT.PlayerState.ENDED) {
                            try {
                                ev.target.seekTo(start, true);
                                ev.target.playVideo();
                            } catch {}
                        }
                    },
                },
            });
        };

        create();

        return () => {
            if (tickerRef.current) {
                clearInterval(tickerRef.current);
                tickerRef.current = null;
            }
            try {
                playerRef.current?.destroy?.();
            } catch {}
            playerRef.current = null;
            if (wrapperRef.current) wrapperRef.current.innerHTML = '';
            firedRef.current = false;
        };
    }, [videoId, start, end, muted]);

    // dışarıdan playing değişince kontrol et
    useEffect(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
            if (playing) p.playVideo();
            else p.pauseVideo();
        } catch {}
    }, [playing]);

    // dışarıdan muted değişince uygula
    useEffect(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
            if (muted) p.mute();
            else p.unMute();
        } catch {}
    }, [muted]);

    return (
        <div
            className={`pointer-events-none fixed inset-0 -z-10 ${blur} ${className}`}
            style={{ opacity }}
            aria-hidden
        >
            <div ref={wrapperRef} className="w-full h-full object-cover" />
            {/* hafif karartma (istersen kaldır) */}
            <div className="absolute inset-0 bg-black/30" />
        </div>
    );
}
