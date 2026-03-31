import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const formData = await request.formData();
  const planKey = formData.get("plan") as PlanKey;

  if (!planKey || !PLANS[planKey] || planKey === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = PLANS[planKey];
  const auth0Id = session.user.sub as string;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth0Id, auth0Id))
    .limit(1);

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: dbUser?.email || (session.user.email as string),
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `EasySite ${plan.name}`,
            description: `EasySite ${plan.name} subscription`,
          },
          unit_amount: plan.price * 100,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      auth0Id,
      planKey,
    },
    success_url: `${process.env.APP_BASE_URL}/en/dashboard?upgraded=1`,
    cancel_url: `${process.env.APP_BASE_URL}/en/pricing`,
  });

  return NextResponse.redirect(checkoutSession.url!, 303);
}
