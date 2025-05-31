import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

let stripePromise: Promise<StripeJS | null> | null = null;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};
