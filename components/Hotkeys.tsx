'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Hotkeys() {
    const router = useRouter();
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k === 'm') {
                const muteBtn = Array.from(document.querySelectorAll('button'))
                    .find(b => b.textContent?.toLowerCase().includes('mute')) as HTMLButtonElement | undefined;
                muteBtn?.click();
            }
            if (k === 'j') router.push('/issue01'); // ileri
            if (k === 'k') router.push('/');       // geri
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [router]);
    return null;
}
