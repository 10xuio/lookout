/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No Stripe signature found" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) {
    console.error("Missing customer or subscription in checkout session");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  // Determine plan type from price ID
  let planType = "free";
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    planType = "basic";
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    planType = "pro";
  }

  await db
    .update(user)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(
        (subscription as any).current_period_end * 1000
      ),
      plan: planType,
      planStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(user.stripeCustomerId, customerId));

  console.log(`User upgraded to ${planType} plan`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  // Determine plan type from price ID
  let planType = "free";
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    planType = "basic";
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    planType = "pro";
  }

  await db
    .update(user)
    .set({
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(
        (subscription as any).current_period_end * 1000
      ),
      plan: planType,
      planStatus:
        subscription.status === "active" ? "active" : subscription.status,
      updatedAt: new Date(),
    })
    .where(eq(user.stripeCustomerId, customerId));

  console.log(`Subscription updated for customer ${customerId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await db
    .update(user)
    .set({
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      plan: "free",
      planStatus: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(user.stripeCustomerId, customerId));

  console.log(`Subscription canceled for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await db
    .update(user)
    .set({
      planStatus: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(user.stripeCustomerId, customerId));

  console.log(`Payment failed for customer ${customerId}`);
}
