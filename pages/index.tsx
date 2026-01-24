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
/* ----------------------- Yazarlar ----------------------- */

function IconMail(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M4 6.5h16v11H4v-11Z"
                stroke="currentColor"
                strokeWidth="1.6"
                opacity="0.9"
            />
            <path
                d="M4.8 7.2 12 12.4l7.2-5.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ----------------------- Yazarlar ----------------------- */
function AuthorsGrid() {
    return (
        <section className="relative z-10 mx-auto max-w-5xl px-6 mt-16">
            <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="text-xl text-white/80">Yazarlar</h2>
                <span className="text-xs text-white/40 hidden sm:inline">
          Kartlara tıkla → yazar profili
        </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                {authors.map((a) => {
                    const traits = a.traits ?? [];
                    const img = a.profileImage || `/images/authors/${a.id}.png`;

                    return (
                        <Link
                            key={a.id}
                            href={`/authors/${a.id}`}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 hover:bg-black/65 transition shadow-[0_0_60px_rgba(0,0,0,.45)]"
                        >
                            {/* yumuşak renk aurası */}
                            <div
                                className="pointer-events-none absolute -inset-12 opacity-0 group-hover:opacity-100 transition duration-500 blur-2xl"
                                style={{
                                    background: `radial-gradient(circle at 25% 20%, ${a.color}22, transparent 55%)`,
                                }}
                                aria-hidden
                            />

                            <div className="relative p-5 md:p-6">
                                {/* header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* avatar */}
                                        <div className="shrink-0">
                                            <div className="h-14 w-14 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={img}
                                                    alt={a.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>

                                        {/* name + tagline */}
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <div
                                                    className="text-2xl md:text-3xl font-semibold"
                                                    style={{ color: a.color }}
                                                >
                                                    {a.name}
                                                </div>
                                                <div className="text-white/45">{a.handle}</div>
                                            </div>

                                            <p className="mt-2 text-white/70 leading-relaxed">
                                                {a.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-white/35 text-sm mt-1 hidden md:block">
                                        Profili aç →
                                    </div>
                                </div>

                                {/* orta metin */}
                                <p className="mt-4 text-white/60 leading-relaxed text-sm md:text-base">
                                    {a.cardBio || a.bio}
                                </p>

                                {/* traits */}
                                {traits.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {traits.slice(0, 3).map((t) => (
                                            <span
                                                key={t}
                                                className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[0.72rem] uppercase tracking-wide text-white/70"
                                            >
                        {t}
                      </span>
                                        ))}
                                    </div>
                                )}

                                {/* footer */}
                                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-white/55">
                                    {a.email ? (
                                        <span className="inline-flex items-center gap-2">
                      <span aria-hidden>✉️</span>
                      <span className="text-white/60">{a.email}</span>
                    </span>
                                    ) : (
                                        <span />
                                    )}

                                    <span className="text-white/35 group-hover:text-white/55 transition">
                    Profili aç →
                  </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
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
                    <section className="px-6 mt-10">
                        <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-black/45 
                    shadow-[0_0_60px_rgba(0,0,0,.75)] px-6 py-8 md:px-8 md:py-10 text-center">
                            {/* Üst açıklama bölümü */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.0 }}
                                viewport={{ once: true }}
                            >
                                <p className="candle-flicker text-lg md:text-xl text-gray-300/95 leading-relaxed">
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
                                <blockquote className="mt-8">
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
                        </div>
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
