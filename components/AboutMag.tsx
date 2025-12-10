'use client';
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutMag() {
    return (
        <section className="relative z-10 mx-auto max-w-4xl px-6 mt-24 md:mt-32">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-2xl text-amber-300 mb-3">
                    Biz kimiz?
                </h2>

                <p className="text-white/80 leading-relaxed">
                    Aynı masada oturmasak da aynı sessizliği paylaşan dört kalemiz.
                    Geceyle Konuşmak’ta her sayıda başka bir temanın peşine düşüyor;
                    hızdan uzak, daha dürüst bir düşünce ritmine alan açıyoruz.
                </p>

                <p className="text-white/70 leading-relaxed mt-4">
                    Kimlere dokunmak istiyoruz?
                </p>

                <ul className="mt-3 space-y-2 text-white/70 list-disc list-inside">
                    <li>Kafasını toparlamak için sessizliğe ihtiyaç duyanlara</li>
                    <li>Derin ve sakin okumayı bir alışkanlık olarak görenlere</li>
                    <li>Metni sadece metin değil, bir eşlik olarak hissedenlere</li>
                </ul>

                <div className="mt-5">
                    <Link
                        href="/issue01"
                        className="inline-flex items-center rounded-xl border border-amber-400 text-amber-300 px-5 py-2.5 hover:bg-amber-400 hover:text-black transition"
                    >
                        İlk sayıya göz at →
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
