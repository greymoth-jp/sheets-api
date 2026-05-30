import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db/client";
import { userSettings, processedWebhooks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

function planFromPriceId(priceId: string): "starter" | "dev" | "team" | "free" {
  const map: Record<string, "starter" | "dev" | "team"> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]: "starter",
    [process.env.STRIPE_PRICE_STARTER_YEARLY ?? ""]: "starter",
    [process.env.STRIPE_PRICE_DEV_MONTHLY ?? ""]: "dev",
    [process.env.STRIPE_PRICE_DEV_YEARLY ?? ""]: "dev",
    [process.env.STRIPE_PRICE_TEAM_MONTHLY ?? ""]: "team",
    [process.env.STRIPE_PRICE_TEAM_YEARLY ?? ""]: "team",
    [process.env.STRIPE_PRICE_FOUNDING ?? ""]: "dev",
  };
  return map[priceId] ?? "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb();

  // Idempotency check
  const already = await db.query.processedWebhooks.findFirst({
    where: eq(processedWebhooks.id, event.id),
  });
  if (already) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        if (!userId) break;

        // Get plan from subscription
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data.price"],
        });
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = planFromPriceId(priceId);

        await db
          .update(userSettings)
          .set({
            plan,
            stripeCustomerId: customerId,
            subscriptionId,
            subscriptionEndsAt: new Date(sub.current_period_end * 1000),
            isFounding:
              priceId === (process.env.STRIPE_PRICE_FOUNDING ?? "") ? true : undefined,
          })
          .where(eq(userSettings.userId, userId));
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId ?? "";
        if (!userId) break;

        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = planFromPriceId(priceId);

        await db
          .update(userSettings)
          .set({
            plan: sub.status === "active" ? plan : "free",
            subscriptionId: sub.id,
            subscriptionEndsAt: new Date(sub.current_period_end * 1000),
          })
          .where(eq(userSettings.userId, userId));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Find user by stripeCustomerId
        const setting = await db.query.userSettings.findFirst({
          where: eq(userSettings.stripeCustomerId, customerId),
        });
        if (setting) {
          await db
            .update(userSettings)
            .set({ plan: "free", subscriptionId: null })
            .where(eq(userSettings.stripeCustomerId, customerId));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.warn("[stripe/webhook] payment failed for customer:", customerId);
        // TODO: send email notification
        break;
      }

      default:
        // Unhandled event — log only
        console.log(`[stripe/webhook] unhandled event: ${event.type}`);
    }

    // Mark as processed
    await db.insert(processedWebhooks).values({
      id: event.id,
      eventType: event.type,
      processedAt: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
