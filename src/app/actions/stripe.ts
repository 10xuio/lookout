"use server";

import { stripe, PLANS } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function createCheckoutSession(planType: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Authentication required");
    }

    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      throw new Error("Invalid plan type");
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    if (planType === "free") {
      throw new Error("Cannot create checkout for free plan");
    }

    // Get or create Stripe customer
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: {
          userId: dbUser.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await db
        .update(user)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
    }

    // Create checkout session
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
        userId: session.user.id,
        planType,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout URL");
    }

    // Redirect to Stripe checkout
    redirect(checkoutSession.url);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw error;
  }
}
