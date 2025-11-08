'use client';
import { useMemo, useState } from 'react';
import ModalShell from './ModalShell';

export default function SubscribeModal({ open, onClose }:{ open: boolean; onClose: ()=>void }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const valid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

    async function start() {
        if (!valid) return;
        setLoading(true);
        try {
            await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
            const r = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
            const d = await r.json();
            if (d?.url) window.location.href = d.url; else alert(d?.error || 'Bir hata oluştu');
        } finally { setLoading(false); }
    }

    return (
        <ModalShell open={open} onClose={onClose} title="Üyelik — 50 TL/Ay" width="max-w-lg">
            <p className="text-white/70 mt-1">
                E-postanı yaz; Stripe üzerinden aboneliği başlat.
            </p>

            <div className="mt-4 space-y-3">
                <input
                    className="input w-full"
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <div className="flex gap-2">
                    <button
                        className={`btn btn-primary ${(!valid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={start}
                        disabled={!valid || loading}
                    >
                        {loading ? 'Yönlendiriliyor…' : 'Aboneliği Başlat'}
                    </button>
                    <button className="btn" onClick={onClose}>Kapat</button>
                    <p className="text-xs text-white/60 mt-3">
                        Zaten hesabın var mı? <a href="/auth" className="underline">Giriş yap</a>.
                    </p>

                </div>
            </div>

            <p className="text-xs text-white/60 mt-3">
                Ödeme Stripe ile güvenle alınır. Dilediğin zaman iptal edebilirsin.
            </p>
        </ModalShell>
    );
}
