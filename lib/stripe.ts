// lib/stripe.ts
import Stripe from "stripe";

/**
 * Env yoksa bile build'in düşmemesi için güvenli kurulum.
 * Not: apiVersion alanını VERMEYİZ → Stripe types en son sürümü bekliyor,
 * sabit string literal yüzünden TS hatası çıkıyor. O yüzden default bırakıyoruz.
 */
const secret = process.env.STRIPE_SECRET_KEY ?? "";
export const PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

/** Env yoksa null; varsa Stripe instance.  */
export const stripe: Stripe | null = secret ? new Stripe(secret) : null;

// İsteyen hem default hem named import edebilsin:
export default stripe;
