import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest){
    const { email } = await req.json();
    if(!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('sa_email', email, { httpOnly: false, path: '/', maxAge: 60*60*24*365 });
    return res;
}
