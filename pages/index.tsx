'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import BackgroundYouTube from '../components/BackgroundYouTube';
import { authors } from '../data/authors';
import SubscribeModal from '../components/SubscribeModal';
import Header from '../components/Header';

function AuthorsGrid() {
    return (
        <section className="relative z-10 mx-auto max-w-4xl px-6 mt-16">
            <h2 className="text-xl text-white/80 mb-4">Yazarlar</h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {authors.map(a => (
                    <Link
                        key={a.id}
                        href={`/authors/${a.id}`}
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                            <span className="text-amber-300 text-lg">{a.name}</span>
                        </div>
                        <p className="text-white/70 mt-2">{a.tagline}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);       // autoplay için sessiz başla
    const [revealVideo, setRevealVideo] = useState(false);
    const [showSubscribe, setShowSubscribe] = useState(false);

    // Görüntüyü 3.5 sn geciktir (müzik hemen, görüntü sonra)
    useEffect(() => {
        if (!playing) {
            setRevealVideo(false);
            return;
        }
        const t = setTimeout(() => setRevealVideo(true), 3500);
        return () => clearTimeout(t);
    }, [playing]);

    return (
        <>
            {/* SABİT HEADER */}
            <Header />

            {/* Header yüksekliğini telafi etmek için pt-14 */}
            <main className="relative min-h-screen overflow-hidden pt-14">
                <BackgroundYouTube
                    videoId="7DkIKFGJh14"
                    start={0}
                    end={240}
                    opacity={0.35}
                    blur="blur-[1px]"
                    playing={playing}
                    muted={muted}
                />

                {/* Görseli geciktiren karartma katmanı (videonun ÜSTÜ, içeriğin ALTINDA) */}
                <div
                    className={`pointer-events-none fixed inset-0 -z-5 bg-black transition-opacity duration-700 ${
                        revealVideo ? 'opacity-0' : 'opacity-80'
                    }`}
                    aria-hidden
                />

                {/* Play düğmesi (sadece başlamadıysa) */}
                {!playing && (
                    <button
                        onClick={() => setPlaying(true)}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 border border-amber-400 text-amber-300 px-6 py-3 rounded-xl hover:bg-amber-400 hover:text-black transition z-20"
                    >
                        ▶ Videoyu Başlat
                    </button>
                )}

                {/* Ses aç/kapa */}
                <button
                    onClick={() => { if (!playing) setPlaying(true); setMuted(m => !m); }}
                    className="absolute bottom-10 right-10 bg-white/10 border border-amber-400 text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-400 hover:text-black transition z-20"
                    aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
                    title={muted ? 'Sesi aç' : 'Sesi kapat'}
                >
                    {muted ? '🔇 Ses Kapalı' : '🔊 Ses Açık'}
                </button>

                {/* alttan sıcaklık */}
                <div className="heater-glow" aria-hidden />

                {/* içerik */}
                <div className="relative z-10">
                    <Hero />

                    <div className="flex flex-col items-center text-center px-6 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1.0 }}
                            viewport={{ once: true }}
                        >
                            <p className="candle-flicker max-w-2xl text-gray-300 mb-8">
                                “Bazı geceler vardır, düşünceler insanı değil, insan düşünceleri taşır.”
                            </p>
                        </motion.div>

                        <button
                            onClick={() => setShowSubscribe(true)}
                            className="border border-amber-400 px-6 py-3 rounded-xl text-amber-400 hover:bg-amber-400 hover:text-black transition"
                        >
                            İlk Sayıya Gir →
                        </button>
                    </div>

                    <AuthorsGrid />
                </div>

                <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} />
            </main>
        </>
    );
}
