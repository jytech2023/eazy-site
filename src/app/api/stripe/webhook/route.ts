import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const auth0Id = session.metadata?.auth0Id;
    const planKey = session.metadata?.planKey;
    if (auth0Id && planKey) {
      await db
        .update(users)
        .set({
          plan: planKey,
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        })
        .where(eq(users.auth0Id, auth0Id));
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    await db
      .update(users)
      .set({ plan: "free", updatedAt: new Date() })
      .where(eq(users.stripeCustomerId, customerId));
  }

  return NextResponse.json({ received: true });
}
