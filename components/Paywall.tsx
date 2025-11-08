'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Paywall({ children }:{ children: React.ReactNode }){
    const [status, setStatus] = useState<'loading'|'paid'|'none'>('loading');

    useEffect(()=>{ (async ()=>{
        try{
            const r = await fetch('/api/me');
            const d = await r.json();
            setStatus(d?.isSubscribed ? 'paid' : 'none');
        }catch{ setStatus('none'); }
    })(); },[]);

    if(status === 'loading') return <div className="card">Yükleniyor…</div>;
    if(status === 'paid')    return <>{children}</>;

    return (
        <div className="card">
            <h2 className="text-xl font-semibold">Üyelik gerekli</h2>
            <p className="text-white/70 mt-2">Bu içeriği okumak için abonelik gerekir. E-postayla giriş yapıp aboneliği başlat.</p>
            <div className="mt-3 flex gap-2">
                <Link href="/auth" className="btn">Giriş</Link>
                <Link href="/subscribe" className="btn btn-primary">Üye Ol</Link>
            </div>
        </div>
    );
}
