// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const stripe = requireStripe();

    // Burada webhook olayını doğrulayıp işleyebilirsin.
    // Geçici olarak derlemenin geçmesi için 200 döndürelim:
    return NextResponse.json({ ok: true });
}
