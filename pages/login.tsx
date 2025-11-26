// pages/login.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const r = useRouter();

    async function submit() {
        if (!email) return;
        setLoading(true);
        try {
            await fetch('/api/auth', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ email })
            });
            r.replace('/admin');             // ⬅️ burada anahtar: direkt admin’e gönder
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white grid place-items-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
                <h1 className="text-amber-300 text-xl mb-3">Giriş</h1>
                <input className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 mb-3"
                       value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="E-posta"/>
                <button onClick={submit} disabled={loading}
                        className="w-full rounded-lg border border-amber-400 text-amber-300 px-3 py-2 hover:bg-amber-400 hover:text-black transition">
                    {loading ? 'Gönderiliyor…' : 'Giriş yap'}
                </button>
            </div>
        </div>
    );
}
