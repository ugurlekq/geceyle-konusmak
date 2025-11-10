'use client';
import { useEffect, useRef } from 'react';

type Props = {
    videoId: string;
    start?: number;
    end?: number;
    opacity?: number;
    blur?: string;
    playing?: boolean;
    muted?: boolean;
    heightClass?: string; // banner yüksekliği
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
                                              end = 240,
                                              opacity = 0.35,
                                              blur = '',
                                              playing = true,
                                              muted = true,
                                              heightClass = 'h-[52vh] md:h-[46vh]',
                                          }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    // 1) IFrame API yükle
    useEffect(() => {
        if (window.YT?.Player) return; // zaten yüklü
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }, []);

    // 2) Player oluştur
    useEffect(() => {
        if (!containerRef.current) return;

        function create() {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player(containerRef.current, {
                host: 'https://www.youtube-nocookie.com', // çerez ve hesap çatışmalarını azalt
                height: '100%',
                width: '100%',
                videoId,
                playerVars: {
                    autoplay: 1,           // otomatik başlat
                    mute: muted ? 1 : 0,   // autoplay için sessiz
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    disablekb: 1,
                    fs: 0,
                    start,
                    end,
                    loop: 1,
                    playlist: videoId,     // loop için gerekli
                    origin: window.location.origin,
                },
                events: {
                    onReady: (e: any) => {
                        try {
                            if (muted) e.target.mute();
                            e.target.setVolume(50);
                            if (playing) e.target.playVideo();
                        } catch {}
                    },
                    onStateChange: (e: any) => {
                        // Durum gerektiğinde debug etmek için burayı açabilirsin
                        // console.log('YT state:', e.data);
                    },
                },
            });
        }

        if (window.YT?.Player) create();
        else {
            window.onYouTubeIframeAPIReady = () => create();
        }

        return () => {
            try {
                playerRef.current?.destroy?.();
            } catch {}
            playerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    // 3) playing değişince uygula
    useEffect(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
            if (playing) p.playVideo();
            else p.pauseVideo();
        } catch {}
    }, [playing]);

    // 4) muted değişince uygula (unmute + play tetikle)
    useEffect(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
            if (muted) p.mute();
            else {
                p.unMute();
                p.setVolume(60);
                p.playVideo(); // bazı tarayıcılarda unmute için ekstra oynat tetik gerekir
            }
        } catch {}
    }, [muted]);

    return (
        <div
            className={`fixed left-0 right-0 top-0 ${heightClass} -z-10 pointer-events-none overflow-hidden`}
            style={{
                opacity,
                WebkitMaskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,.85) 60%, rgba(0,0,0,0) 100%)',
                maskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,.85) 60%, rgba(0,0,0,0) 100%)',
            }}
            aria-hidden
        >
            <div className={`absolute inset-0 ${blur}`}>
                {/* iframe bu div'in içine mount edilir */}
                <div id="yt-bg" ref={containerRef} className="w-full h-full"></div>
            </div>
        </div>
    );
}
