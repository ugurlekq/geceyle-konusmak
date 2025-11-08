'use client';
import { useEffect, useState } from 'react';

export default function AccountPage(){
    const [me, setMe] = useState<{email?:string; isSubscribed?:boolean}>({});
    useEffect(()=>{ (async()=>{ const r=await fetch('/api/me'); setMe(await r.json()); })(); },[]);
    async function portal(){ const r=await fetch('/api/portal',{method:'POST'}); const d=await r.json(); if(d?.url) window.location.href=d.url; else alert(d?.error || 'Hata'); }
    return (
        <div className="card space-y-2">
            <h1 className="text-xl font-semibold">Hesabım</h1>
            <div>E-posta: <b>{me.email || '—'}</b></div>
            <div>Üyelik: <b>{me.isSubscribed ? 'Aktif' : 'Pasif'}</b></div>
            <button className="btn" onClick={portal}>Stripe Portal</button>
        </div>
    );
}
