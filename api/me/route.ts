import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const stripe = requireStripe();

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    if (!customer) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ id: customer.id });
}
