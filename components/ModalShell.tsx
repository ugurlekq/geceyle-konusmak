'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ModalShell({
                                       open, onClose, title, children, width = 'max-w-md',
                                   }: {
    open: boolean; onClose: () => void; title?: string; children: React.ReactNode; width?: string;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop (stil normal div'de, animasyon motion-child'ta) */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    {/* Konteyner (stil normal div'de, animasyon motion-child'ta) */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.18 }}
                        >
                            {/* Kart */}
                            <div className={`relative w-full ${width} rounded-2xl border border-white/10 bg-white/5 shadow-xl`}>
                                {/* gradient ring */}
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-400/30 via-yellow-300/10 to-transparent"
                                />
                                <div className="relative p-6">
                                    {title && <h3 className="text-lg font-semibold text-amber-300">{title}</h3>}
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
