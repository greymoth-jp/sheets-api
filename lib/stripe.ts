import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  _stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  return _stripe;
}

export const PLANS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
  dev_monthly: process.env.STRIPE_PRICE_DEV_MONTHLY ?? "",
  dev_yearly: process.env.STRIPE_PRICE_DEV_YEARLY ?? "",
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
  team_yearly: process.env.STRIPE_PRICE_TEAM_YEARLY ?? "",
  founding: process.env.STRIPE_PRICE_FOUNDING ?? "",
} as const;

export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  stripeCustomerId,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  stripeCustomerId?: string | null;
}): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetsapi.io";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      description: "SheetsAPI subscription — auto-renews unless cancelled",
      metadata: { userId },
    },
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId },
    allow_promotion_codes: true,
  });

  return session.url ?? `${appUrl}/pricing`;
}

export async function createCustomerPortal(
  stripeCustomerId: string
): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetsapi.io";

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return session.url;
}
