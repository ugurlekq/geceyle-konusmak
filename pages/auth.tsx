'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthPage(){
    const router = useRouter();
    const next = (router.query.next as string) || '/account';

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const valid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

    // varsa mevcut cookie'deki email'i al
    useEffect(()=>{ (async()=>{
        try{ const r=await fetch('/api/me'); const d=await r.json(); if(d?.email) setEmail(d.email);}catch{}
    })(); },[]);

    async function save(){
        if(!valid) return;
        setLoading(true);
        try{
            await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
            router.replace(next); // ?next=... geldiyse oraya dön
        } finally { setLoading(false); }
    }

    return (
        <div className="mx-auto max-w-md mt-16 card">
            <h1 className="text-xl font-semibold text-amber-300">Giriş / Kayıt</h1>
            <p className="text-white/70 mt-2">E-postanı yaz; oturumunu başlatalım.</p>

            <div className="mt-4 space-y-3">
                <input className="input w-full" placeholder="ornek@eposta.com"
                       value={email} onChange={e=>setEmail(e.target.value)} />
                <button className={`btn btn-primary ${(!valid||loading)?'opacity-50 cursor-not-allowed':''}`}
                        disabled={!valid||loading} onClick={save}>
                    {loading ? 'Kaydediliyor…' : 'Devam'}
                </button>
            </div>
        </div>
    );
}
