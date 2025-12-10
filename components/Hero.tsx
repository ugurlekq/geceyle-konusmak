import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="pt-20 pb-12 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
            >
                <h1 className="candle-flicker text-5xl md:text-7xl text-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,.18)]">
                    Geceyle Konuşmak
                </h1>

                <p className="candle-flicker max-w-2xl mx-auto mt-6 text-gray-200">
                    Bir sohbetin felsefeye, felsefenin sessizliğe dönüştüğü an…
                </p>

                {/* Küçük açıklama satırı */}
                <p className="mt-3 text-sm md:text-base text-white/55">
                    Aylık yazı & müzik eşlik dergisi. Yavaş okunan cümleler, geceye açılan sayfalar.
                </p>

                {/* CTA’lar */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        href="/issue01"
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm md:text-base
                                   bg-amber-400/90 text-black font-medium
                                   border border-amber-300
                                   hover:bg-amber-300 hover:border-amber-200
                                   shadow-[0_0_24px_rgba(251,191,36,.35)]
                                   transition"
                    >
                        İlk sayıyı keşfet
                    </Link>

                    {/* Üyeliği incele → artık Neden Üyelik’e kaydırıyor */}
                    <Link
                        href="#membership"
                        className="inline-flex items-center rounded-xl border border-amber-400/70 text-amber-300 px-5 py-2.5 bg-black/30 hover:bg-amber-400 hover:text-black transition"
                    >
                        Üyeliği incele
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
