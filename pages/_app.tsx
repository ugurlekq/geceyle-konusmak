import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import VisualOverlay from "../components/VisualOverlay";
import ThemeToggle from "../components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";

export default function App({ Component, pageProps, router }: AppProps) {
    return (
        <SessionProvider session={(pageProps as any).session}>
            <VisualOverlay>
                {/* tüm sayfalarda ortam */}
                <div className="warm-wash" aria-hidden />
                <div className="heater-glow" aria-hidden />

                <ThemeToggle />

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={router.route}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        {/* stiller motion içinde değil */}
                        <div className="relative z-10">
                            <Component {...pageProps} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </VisualOverlay>
        </SessionProvider>
    );
}

