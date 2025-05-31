"use server";

import { stripe, PLANS, isPlanType } from "@/lib/stripe/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/server";

export async function createCheckoutSession(planType: string) {
  try {
    const authUser = await getUser();

    if (!authUser) {
      throw new Error("User not found");
    }

    if (!planType || !isPlanType(planType)) {
      throw new Error("Invalid plan type");
    }

    const plan = PLANS[planType];

    if (planType === "free") {
      throw new Error("Cannot create checkout for free plan");
    }

    let customerId = authUser.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: authUser.email,
        name: authUser.name,
        metadata: {
          userId: authUser.id,
        },
      });

      customerId = customer.id;

      await db
        .update(user)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, authUser.id));
    }

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
      metadata: {
        userId: authUser.id,
        planType,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout URL");
    }

    redirect(checkoutSession.url);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw error;
  }
}
