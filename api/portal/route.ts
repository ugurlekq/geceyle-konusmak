import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(){
    const email = (await import('next/headers')).cookies().get('sa_email')?.value;
    if(!email) return NextResponse.json({ error: 'login required' }, { status: 401 });

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if(!customer) return NextResponse.json({ error: 'customer not found' }, { status: 404 });

    const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return NextResponse.json({ url: session.url });
}
