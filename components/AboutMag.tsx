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
                <h2 className="text-2xl text-amber-300 mb-3">Biz kimiz?</h2>

                <p className="text-white/80 leading-relaxed">
                    Aynı masada oturmasak da aynı sessizliği paylaşan dört kalemiz.
                    Geceyle Konuşmak’ta her sayıda başka bir temanın izini sürüyor;
                    hızın değil, anlamın ritmine alan açıyoruz.
                </p>

                <p className="text-white/70 leading-relaxed mt-4">
                    Bu alan “yüksek ses” üretmek için değil; daha az cümleyle daha çok şey duymak için var.
                    Bizim derdimiz isyanı büyütmek değil — insanı uyandıran o ince tokadı doğru yere koymak.
                </p>

                <p className="text-white/70 leading-relaxed mt-4">
                    Kimlere dokunmak istiyoruz?
                </p>

                <ul className="mt-3 space-y-2 text-white/70 list-disc list-inside">
                    <li>Gürültüden yorulup zihnini toparlamak isteyenlere</li>
                    <li>Derin ve sakin okumayı bir alışkanlık olarak görenlere</li>
                    <li>Metni sadece metin değil, bir eşlik gibi hissedenlere</li>
                    <li>Gündelik psikolojiyi ve sokağın nabzını “bağırmadan” okumak isteyenlere</li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/about"
                        className="inline-flex items-center rounded-xl border border-amber-400 text-amber-300 px-5 py-2.5 hover:bg-amber-400 hover:text-black transition"
                    >
                        Hakkında →
                    </Link>
                    
                </div>
                
            </motion.div>
        </section>
    );
}
