import { NextRequest, NextResponse } from "next/server";
import { PlanType, stripe, type Stripe } from "@/lib/stripe/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
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

  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (typeof customerId !== "string" || typeof subscriptionId !== "string") {
    console.error("Invalid customer or subscription in checkout session");
    return;
  }

  let subscription: Stripe.Response<Stripe.Subscription>;

  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return;
  }

  try {
    const priceId = subscription.items.data[0]?.price.id;

    if (!priceId) {
      console.error("No price ID found in subscription");
      return;
    }

    let planType: PlanType = "free";
    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
      planType = "basic";
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = "pro";
    }

    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

    await db
      .update(user)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        plan: planType,
        planStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(user.stripeCustomerId, customerId));

    console.log(`User upgraded to ${planType} plan`);
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer;

  if (typeof customerId !== "string") {
    console.error("Invalid customer in subscription");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  let planType: PlanType = "free";
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
    planType = "basic";
  } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    planType = "pro";
  }

  try {
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

    await db
      .update(user)
      .set({
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        plan: planType,
        planStatus:
          subscription.status === "active" ? "active" : subscription.status,
        updatedAt: new Date(),
      })
      .where(eq(user.stripeCustomerId, customerId));

    console.log(`Subscription updated for customer ${customerId}`);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer;

  if (typeof customerId !== "string") {
    console.error("Invalid customer in subscription");
    return;
  }

  try {
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
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer;

  if (typeof customerId !== "string") {
    console.error("Invalid customer in invoice");
    return;
  }

  try {
    await db
      .update(user)
      .set({
        planStatus: "past_due",
        updatedAt: new Date(),
      })
      .where(eq(user.stripeCustomerId, customerId));

    console.log(`Payment failed for customer ${customerId}`);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return;
  }
}
