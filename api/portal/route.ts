import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireStripe } from "@/lib/stripe";

export async function POST() {
    const email = cookies().get("sa_email")?.value;
    if (!email) {
        return NextResponse.json({ error: "login required" }, { status: 401 });
    }

    const stripe = requireStripe();

    const { data } = await stripe.customers.list({ email, limit: 1 });
    const customer = data[0];
    if (!customer) {
        return NextResponse.json({ error: "customer not found" }, { status: 404 });
    }

    const returnUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/account`
        : "/account";

    const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
}
