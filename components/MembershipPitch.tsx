'use client';
import { motion } from 'framer-motion';

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
                <h2 className="text-2xl text-amber-300 mb-3">Neden Üyelik?</h2>

                <p className="text-white/80 leading-relaxed">
                    Geceyle Konuşmak; düşüncenin yavaşladığı, duygunun derinleştiği bir yazı-müzik deneyimi.
                    Üyelikle birlikte:
                </p>

                <ul className="mt-3 space-y-2 text-white/70 list-disc list-inside">
                    <li>Yazılara eşlik eden özel kürasyon müzik/ambient mix’lere erişim</li>
                    <li>Üyelere özel denemeler ve erken yayınlanan sayfalar</li>
                    <li>Reklamsız, ritmi bozulmayan okuma deneyimi</li>
                    <li>Yazar sohbetlerinden seçili kayıtlar</li>
                </ul>

                <div className="mt-5">
                    <a
                        href="/subscribe"
                        className="inline-flex items-center rounded-xl border border-amber-400 text-amber-300 px-5 py-2.5 hover:bg-amber-400 hover:text-black transition"
                    >
                        Üyeliği İncele →
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
