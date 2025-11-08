// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import stripeDefault, { PRICE_ID } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // JSON oku
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    // Stripe ve PRICE_ID kontrolü
    if (!stripeDefault) {
      return NextResponse.json(
        { error: "Stripe not configured (STRIPE_SECRET_KEY missing)" },
        { status: 500 }
      );
    }
    if (!PRICE_ID) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID missing" },
        { status: 500 }
      );
    }

    // Base URL (Vercel prod / preview için güvenli fallback)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripeDefault.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/account`,
      cancel_url: `${baseUrl}/subscribe`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
    }
}
