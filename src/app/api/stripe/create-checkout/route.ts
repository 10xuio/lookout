import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, isPlanType } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/server";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { planType } = await request.json();

    if (!planType || !isPlanType(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    let customerId = authUser.stripeCustomerId;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: authUser.email,
        name: authUser.name,
        metadata: {
          userId: authUser.id,
        },
      });

      customerId = stripeCustomer.id;
      await db
        .update(user)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, authUser.id));
    }

    const plan = PLANS[planType];
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId: authUser.id, planType },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
