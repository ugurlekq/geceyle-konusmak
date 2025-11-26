// pages/index.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

import Header from '../components/Header';
import Hero from '../components/Hero';
import MembershipPitch from '../components/MembershipPitch';
import AboutMag from '../components/AboutMag';
import Embers from '@/components/Embers';
import BackgroundYouTube from '../components/BackgroundYouTube';
import SubscribeModal from '../components/SubscribeModal';
import Footer from '../components/Footer';              // <<< EKLENDİ

import { getArticles } from '@/lib/adminStore';
import type { Article } from '@/types';
import { authors } from '../data/authors';

/* ----------------------- Yazarlar ----------------------- */
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
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: a.color }}
                            />
                            <span className="text-amber-300 text-lg">{a.name}</span>
                        </div>
                        <p className="text-white/70 mt-2">{a.tagline}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/* ------------------- Dinamik Yazılar -------------------- */
function DynamicArticles({ items }: { items: Article[] }) {
    if (!items || items.length === 0) return null;
    return (
        <section className="relative z-10 mx-auto max-w-4xl px-6 mt-14">
            <h2 className="text-xl text-white/80 mb-4">Yeni Yazılar</h2>
            <div className="grid gap-4">
                {items.slice(0, 8).map((a) => {
                    const href = a.slug ? `/articles/${a.slug}` : '#';
                    return (
                        <Link
                            key={a.id || a.slug}
                            href={href}
                            className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-amber-300 text-lg group-hover:text-amber-200 transition">
                                    {a.title}
                                </div>
                                <div className="text-xs text-white/60 shrink-0">
                                    {(a.date || '').slice(0, 10)}{' '}
                                    {a.issueNumber ? `• Sayı ${a.issueNumber}` : ''}
                                </div>
                            </div>
                            {a.excerpt && (
                                <p className="text-white/70 mt-2">{a.excerpt}</p>
                            )}
                            {!!a.embedUrl && (
                                <div className="mt-2 text-sm text-white/60">
                                    🎧 Bu yazıda müzik var
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

/* ------------------------- Sayfa ------------------------ */
export default function Home() {
    // Video
    const [playing] = useState(true);
    const [muted, setMuted] = useState(true);
    const { scrollY } = useScroll();
    const overlayOpacity = useTransform(scrollY, [0, 200, 400], [0, 0.35, 0.6]);
    const bannerH = 'h-[52vh] md:h-[46vh]';

    // Reveal
    const [revealVideo, setRevealVideo] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRevealVideo(true), 3500);
        return () => clearTimeout(t);
    }, []);

    // // Dinamik yazılar
    // const [dynArticles, setDynArticles] = useState<Article[]>([]);
    // useEffect(() => {
    //     try {
    //         setDynArticles(getArticles());
    //     } catch {}
    // }, []);

    // Üyelik modal
    const [showSubscribe, setShowSubscribe] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="relative flex-1 overflow-hidden pt-14 pb-40">
                {/* Arka plan video */}
                <BackgroundYouTube
                    videoId="7DkIKFGJh14"
                    start={0}
                    end={240}
                    opacity={0.35}
                    blur="blur-[1px]"
                    playing={playing}
                    muted={muted}
                    heightClass={bannerH}
                />

                {/* Kıvılcım / mum */}
                <Embers />

                {/* Üstte karartma (reveal + scroll) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    style={{ opacity: revealVideo ? overlayOpacity : 0.8 }}
                >
                    <div
                        className={`pointer-events-none fixed left-0 right-0 top-0 ${bannerH} -z-5 bg-black`}
                        aria-hidden
                    />
                </motion.div>

                {/* Ses butonu */}
                <button
                    onClick={() => setMuted((m) => !m)}
                    className="fixed z-40 right-[calc(env(safe-area-inset-right,0px)+16px)]
                     bottom-[calc(env(safe-area-inset-bottom,0px)+16px)]
                     px-4 py-2 rounded-xl border border-amber-400
                     bg-black/30 backdrop-blur-sm text-amber-300
                     hover:bg-amber-400 hover:text-black transition shadow-lg"
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

                    {/* MOTTOLAR */}
                    <section className="text-center px-6 mt-10">
                        {/* Üst açıklama bölümü */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.0 }}
                            viewport={{ once: true }}
                        >
                            <p className="candle-flicker max-w-3xl mx-auto text-lg md:text-xl text-gray-300/95 leading-relaxed">
                                Geceyle Konuşmak; düşüncenin acele etmediği,
                                kelimelerin kendi ritmine döndüğü bir alan.
                                <br className="hidden md:block" />
                                Bu dergide yazı bir açıklama değil — bir eşliktir.
                                <br className="hidden md:block" />
                                Kimi cümleler sessizlikte duyulur; kimi sorular insana
                                dışarıdan değil, içeriden yol açar.
                            </p>

                            <div className="mx-auto mt-8 h-px w-24 bg-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,.35)]" />
                        </motion.div>

                        {/* Alıntı bölümü */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.9 }}
                        >
                            <blockquote className="max-w-3xl mx-auto mt-8">
                                <p className="candle-flicker text-amber-300 text-xl md:text-2xl italic leading-relaxed">
                                    “Bazı geceler vardır; düşünceler insanı değil,
                                    insan düşünceleri taşır.”
                                </p>
                                <p className="mt-3 text-white/60 text-base md:text-lg">
                                    Ve o gecelerde, bir cümle bütün günün ağırlığını
                                    tek başına taşır.
                                </p>
                            </blockquote>
                        </motion.div>
                    </section>


                    {/* Dinamik Yazılar (istersen tekrar açarız) */}
                    {/* <DynamicArticles items={dynArticles} /> */}

                    {/* Diğer bölümler */}
                    <MembershipPitch />
                    <AboutMag />
                    <AuthorsGrid />
                </div>

                <SubscribeModal
                    open={showSubscribe}
                    onClose={() => setShowSubscribe(false)}
                />
            </main>

            <Footer />
        </div>
    );
}
