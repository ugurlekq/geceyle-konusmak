'use client';
import { useEffect, useState } from 'react';

export default function AccountPage(){
    const [me, setMe] = useState<{email?:string; isSubscribed?:boolean}>({});
    const [busy, setBusy] = useState(false);

    useEffect(()=>{ (async()=>{ const r=await fetch('/api/me'); setMe(await r.json()); })(); },[]);

    async function portal(){
        setBusy(true);
        try{
            const r=await fetch('/api/portal',{method:'POST'}); const d=await r.json();
            if(d?.url) window.location.href=d.url; else alert(d?.error || 'Hata');
        } finally { setBusy(false); }
    }

    async function logout(){
        setBusy(true);
        try{
            await fetch('/api/logout',{method:'POST'});
            window.location.href='/';
        } finally { setBusy(false); }
    }

    return (
        <div className="mx-auto max-w-xl mt-10 card">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-amber-300 text-lg">
                    {(me.email || 'U')[0]?.toUpperCase()}
                </div>
                <div>
                    <div className="text-lg font-semibold">{me.email || '—'}</div>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1 ${me.isSubscribed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-white/70 border border-white/15'}`}>
                        {me.isSubscribed ? 'Üyelik: Aktif' : 'Üyelik: Pasif'}
                    </div>
                </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
                <button className="btn" onClick={portal} disabled={busy}>Stripe Portal</button>
                <button className="btn" onClick={logout} disabled={busy}>Çıkış Yap</button>
            </div>

            <p className="text-xs text-white/60 mt-4">
                Stripe Portal’dan kartını ve aboneliğini yönetebilirsin.
            </p>
        </div>
    );
}
