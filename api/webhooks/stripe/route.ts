import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest){
    const sig = req.headers.get('stripe-signature');
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if(!sig || !whSecret) return new NextResponse('missing signature', { status: 400 });

    const buf = Buffer.from(await req.arrayBuffer());
    try{
        const event = stripe.webhooks.constructEvent(buf, sig, whSecret);
        // burada log veya özel işlem yapabilirsin
        return NextResponse.json({ received: true, type: event.type });
    }catch(err:any){
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
}
