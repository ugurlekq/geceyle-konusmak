import { NextResponse } from 'next/server';

export async function POST(){
    const res = NextResponse.json({ ok: true });
    res.cookies.set('sa_email', '', { httpOnly: false, path: '/', maxAge: 0 });
    return res;
}
