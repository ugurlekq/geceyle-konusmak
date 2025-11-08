import { NextRequest, NextResponse } from "next/server";
import { requireStripe, PRICE_ID } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    if (!PRICE_ID) return NextResponse.json({ error: "STRIPE_PRICE_ID missing" }, { status: 500 });

    const stripe = requireStripe();

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [{ price: PRICE_ID, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    });

    return NextResponse.json({ url: session.url });
}
