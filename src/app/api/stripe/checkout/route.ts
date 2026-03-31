import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const formData = await request.formData();
  const planKey = formData.get("plan") as PlanKey;

  if (!planKey || !PLANS[planKey] || planKey === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = PLANS[planKey];

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: session.user.email as string,
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
      email: session.user.email as string,
      planKey,
    },
    success_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/en/dashboard?upgraded=1`,
    cancel_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/en/pricing`,
  });

  return NextResponse.redirect(checkoutSession.url!, 303);
}
