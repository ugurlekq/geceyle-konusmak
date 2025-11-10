'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function Embers() {
    const dots = useMemo(
        () =>
            new Array(10).fill(0).map((_, i) => ({
                key: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                delay: Math.random() * 3,
                duration: 5 + Math.random() * 4,
            })),
        []
    );

    return (
        <section className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            {dots.map((dot) => (
                <motion.div
                    key={dot.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0.2, 0.8, 0.2], y: [-15, 15, -15] }}
                    transition={{
                        duration: dot.duration,
                        repeat: Infinity,
                        delay: dot.delay,
                        ease: 'easeInOut',
                    }}
                >
                    <div
                        className="absolute w-[5px] h-[5px] rounded-full bg-amber-300/60 blur-[1.2px]"
                        style={{ left: dot.left, top: dot.top }}
                    />
                </motion.div>
            ))}
        </section>
    );
}
