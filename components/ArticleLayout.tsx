'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Link from 'next/link';

export default function ArticleLayout({ title, children }: { title: string; children: ReactNode }) {
    return (
        <article className="max-w-3xl mx-auto px-6 py-16 leading-relaxed text-gray-200">
            {/* motion.h1 yerine motion.div + içeride normal <h1> */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                <h1 className="text-4xl text-amber-400 mb-8">{title}</h1>
            </motion.div>

            {/* className'i motion'a değil, içerideki elemana veriyoruz (gerekirse) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
                {children}
            </motion.div>

            <div className="mt-12 text-center">
                <Link href="/issue01" className="text-amber-400 hover:underline">
                    ← Sayıya Dön
                </Link>
            </div>
        </article>
    );
}
