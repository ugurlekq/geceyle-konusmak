'use client';
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current!;
        const onMove = (e: MouseEvent) => {
            el.style.setProperty('--x', e.clientX + 'px');
            el.style.setProperty('--y', e.clientY + 'px');
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div
            ref={ref}
            className="pointer-events-none fixed inset-0 z-0"
            style={{
                background:
                    'radial-gradient(240px 180px at var(--x,50%) var(--y,50%), rgba(255,184,77,.08), transparent 60%)'
            }}
        />
    );
}
