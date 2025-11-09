import Stripe from "stripe";

export const PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
const secret = process.env.STRIPE_SECRET_KEY ?? "";

export function requireStripe(): Stripe {
    if (!secret) throw new Error("STRIPE_SECRET_KEY is missing");
    // apiVersion vermiyoruz → hesap varsayılanı, tip uyumsuzluğu yok
    return new Stripe(secret);
}
