'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserMenu(){
    const [me, setMe] = useState<{email?:string; isSubscribed?:boolean}|null>(null);
    useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/me'); setMe(await r.json()); }catch{} })(); },[]);
    if(!me) return null;

    return me.email ? (
        <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">{me.email}</span>
            <Link href="/account" className="btn btn-primary text-sm">Hesap</Link>
        </div>
    ) : (
        <Link href="/auth" className="btn text-sm">Giriş / Kayıt</Link>
    );
}
