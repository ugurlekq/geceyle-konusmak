import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest){
    const email = req.cookies.get('sa_email')?.value;
    if(!email) return NextResponse.json({ email: null, isSubscribed: false });

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if(!customer) return NextResponse.json({ email, isSubscribed: false });

    const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
    });

    return NextResponse.json({ email, isSubscribed: subs.data.length > 0 });
}
