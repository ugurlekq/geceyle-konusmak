'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MembershipPitch() {
    return (
        <section
            id="membership"
            className="relative z-10 mx-auto max-w-4xl px-6 mt-28 md:mt-36 lg:mt-44 scroll-mt-[120px]"
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl text-amber-300 mb-3">Bu alan neye açılıyor?</h2>

                <p className="text-white/80 leading-relaxed">
                    Burası bir “hız” sayfası değil.
                    Yavaşlayan düşüncenin, ortak bir bilinç alanı kurma ihtiyacından doğmuş bir yer.
                </p>

                <ul className="mt-3 space-y-2 text-white/70 list-disc list-inside">
                    <li>Metin + müzik birlikteliği</li>
                    <li>Duyguyu ajite etmeyen, zihni provoke eden yazılar</li>
                    <li>İsyan etmeden sarsan; dayatmadan düşündüren anlatılar</li>
                    <li>Reklamsız, bölünmeyen bir okuma ritmi</li>
                </ul>

                <p className="mt-4 text-white/70 leading-relaxed">
                    Okur olarak kalabilirsin.
                    Ama bir gün, bu sessizliğe kendi kelimelerini de bırakmak isteyebilirsin.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {/* keşfet / son yazılar */}
                    <Link
                        href="/issue01"
                        className="inline-flex items-center rounded-xl border border-amber-400 text-amber-300 px-5 py-2.5 hover:bg-amber-400 hover:text-black transition"
                    >
                        İlk Sayıyı Oku →
                    </Link>

                    {/* sırayla oku */}
                    <Link
                        href="/issues"
                        className="inline-flex items-center rounded-xl border border-white/15 text-white/80 px-5 py-2.5 hover:bg-white/10 transition"
                    >
                        Diğer Sayılar için →
                    </Link>
                </div>

                <p className="mt-3 text-xs text-white/45">
                    Not: Dergiyi sırayla okumak, temaları ve referansları daha net hissettirir.
                </p>
            </motion.div>
        </section>
    );
}
