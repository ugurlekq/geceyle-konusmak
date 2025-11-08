// lib/stripe.ts
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY ?? "";
export const PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

/** Stripe örneği lazım olduğunda çağır. Tipi her zaman Stripe döner. */
export function requireStripe(): Stripe {
    if (!secret) {
        throw new Error("STRIPE_SECRET_KEY is missing");
    }
    // En sade ve hatasız: config hiç vermiyoruz → hesap varsayılan versiyonu kullanılır.
    return new Stripe(secret);

    // Alternatif (yine hatasız): 
    // return new Stripe(secret, { apiVersion: undefined });
}
