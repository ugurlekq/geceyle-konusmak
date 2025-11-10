'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import Header from '../components/Header';
import Hero from '../components/Hero';
import MembershipPitch from '../components/MembershipPitch';
import AboutMag from '../components/AboutMag';
import Embers from '@/components/Embers';
import BackgroundYouTube from '../components/BackgroundYouTube';
import SubscribeModal from '../components/SubscribeModal';

import { authors } from '../data/authors';

function AuthorsGrid() {
    return (
        <section className="relative z-10 mx-auto max-w-4xl px-6 mt-16">
            <h2 className="text-xl text-white/80 mb-4">Yazarlar</h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {authors.map((a) => (
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
    // Video: autoplay + muted
    const [playing] = useState(true);
    const [muted, setMuted] = useState(true);

    // Görsel gecikmeli açılış
    const [revealVideo, setRevealVideo] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRevealVideo(true), 3500);
        return () => clearTimeout(t);
    }, []);

    // Üyelik modal
    const [showSubscribe, setShowSubscribe] = useState(false);

    return (
        <>
            <Header />

            <main className="relative min-h-screen overflow-hidden pt-14 pb-40">
                {/* Arka plan video */}
                <BackgroundYouTube
                    videoId="7DkIKFGJh14"
                    start={0}
                    end={240}
                    opacity={0.35}
                    blur="blur-[1px]"
                    playing={playing}
                    muted={muted}
                    // ✅ üst banner yüksekliği (isteğine göre ayarla)
                    heightClass="h-[52vh] md:h-[46vh]"
                />


                {/* Kıvılcım/mum titreşimleri */}
                <Embers />

                {/* Görüntüyü geciktiren karartma */}
                <div
                    className={`pointer-events-none fixed inset-0 -z-5 bg-black transition-opacity duration-700 ${
                        revealVideo ? 'opacity-0' : 'opacity-80'
                    }`}
                    aria-hidden
                />

                {/* Ses aç/kapa — sabit alt-sağ */}
                <button
                    onClick={() => setMuted((m) => !m)}
                    className="
            fixed z-40
            right-[calc(env(safe-area-inset-right,0px)+16px)]
            bottom-[calc(env(safe-area-inset-bottom,0px)+16px)]
            px-4 py-2 rounded-xl
            border border-amber-400
            bg-black/30 backdrop-blur-sm
            text-amber-300
            hover:bg-amber-400 hover:text-black
            transition shadow-lg
          "
                    aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
                    title={muted ? 'Sesi aç' : 'Sesi kapat'}
                >
                    {muted ? '🔇 Ses Kapalı' : '🔊 Ses Açık'}
                </button>

                {/* Alttan sıcaklık */}
                <div className="heater-glow" aria-hidden />

                {/* İçerik */}
                <div className="relative z-10">
                    <Hero />

                    {/* ——— MOTTOLAR ——— */}
                    <section className="text-center px-6 mt-10">
                        {/* Üst lede (kısa manifesto) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.0 }}
                            viewport={{ once: true }}
                        >
                            <p className="candle-flicker max-w-3xl mx-auto text-lg md:text-xl text-gray-300/95 leading-relaxed">
                                Bir sohbetin felsefeye, felsefenin sessizliğe dönüştüğü an.
                                <br className="hidden md:block" />
                                Gece, kelimelerin hızını alır; düşünce kendi ritmine döner.
                                <br className="hidden md:block" />
                                Okur ve metin, susmayı da konuşmanın bir parçası sayar.
                            </p>
                            {/* İnce amber ayırıcı */}
                            <div className="mx-auto mt-8 h-px w-24 bg-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,.35)]" />
                        </motion.div>

                        {/* Alttaki ana alıntı */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.9 }}
                        >
                            <blockquote className="max-w-3xl mx-auto mt-8">
                                <p className="candle-flicker text-amber-300 text-xl md:text-2xl italic leading-relaxed">
                                    “Bazı geceler vardır; düşünceler insanı değil, insan düşünceleri taşır.”
                                </p>
                                <p className="mt-3 text-white/60 text-base md:text-lg">
                                    Ve o gecelerde, tek bir cümle bütün günün gürültüsünden daha ağır gelir.
                                </p>
                            </blockquote>
                        </motion.div>


                        {/* CTA */}
                        <div className="mt-10 flex justify-center">
                           
                        </div>
                    </section>

                    {/* Neden üyelik? & Biz kimiz? */}
                    <MembershipPitch />
                    <AboutMag />

                    {/* Yazarlar */}
                    <AuthorsGrid />
                </div>

                <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} />
            </main>
        </>
    );
}
