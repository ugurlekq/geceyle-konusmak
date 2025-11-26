import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="pt-16 pb-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
                <h1 className="candle-flicker text-5xl md:text-7xl text-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,.15)]">
                    Geceyle Konuşmak</h1>
                <p className="candle-flicker max-w-2xl mx-auto mt-6 text-gray-300">
                    Bir sohbetin felsefeye, felsefenin sessizliğe dönüştüğü an…
                </p>
            </motion.div>

        </section>
    );
}
