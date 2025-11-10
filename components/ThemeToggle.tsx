'use client';
import { useEffect, useState } from 'react';
type Theme = 'dim' | 'amber' | 'mono';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('amber');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('theme-dim','theme-amber','theme-mono');
        const cls = theme==='dim' ? 'theme-dim' : theme==='mono' ? 'theme-mono' : 'theme-amber';
        document.documentElement.classList.add(cls);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // return (
    //     // <div className="fixed top-4 right-4 z-50 backdrop-blur bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
    //     //     <button onClick={() => setTheme('amber')}
    //     //             className={`px-2 py-1 rounded ${theme==='amber'?'bg-amber-400 text-black':'text-amber-300 border border-amber-400/60'}`}>
    //     //         Amber
    //     //     </button>
    //     //     <button onClick={() => setTheme('dim')}
    //     //             className={`px-2 py-1 rounded ${theme==='dim'?'bg-gray-300 text-black':'text-gray-200 border border-gray-400/50'}`}>
    //     //         Dim
    //     //     </button>
    //     //     <button onClick={() => setTheme('mono')}
    //     //             className={`px-2 py-1 rounded ${theme==='mono'?'bg-white text-black':'text-gray-100 border border-gray-300/50'}`}>
    //     //         Mono
    //     //     </button>
    //     // </div>
    // );
}
