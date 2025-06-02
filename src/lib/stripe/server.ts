import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export type { Stripe };

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!stripeInstance) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-05-28.basil",
        typescript: true,
      });
    }
    return Reflect.get(stripeInstance, prop, stripeInstance);
  },
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: "",
    features: [
      "5 prompts per month",
      "Basic AI provider (OpenAI only)",
      "Standard processing time",
      "Basic analytics",
    ],
    limits: {
      promptsPerDay: 0,
      promptsPerMonth: -1,
      topicsLimit: 1,
      providers: ["openai"],
      priority: "low",
    },
  },
  basic: {
    name: "Basic",
    price: 50,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: [
      "25 prompts per day",
      "Track 5 topics or brands",
      "All AI providers (OpenAI, Claude, Gemini)",
      "Priority processing",
      "Advanced analytics",
    ],
    limits: {
      promptsPerDay: 25,
      promptsPerMonth: -1,
      topicsLimit: 5,
      providers: ["openai", "claude", "google"],
      priority: "normal",
    },
  },
  pro: {
    name: "Professional",
    price: 100,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "100 prompts per day",
      "Track 10 topics or brands",
      "All AI providers",
      "Highest priority processing",
      "Advanced analytics & reporting",
      "API access",
      "Priority support",
    ],
    limits: {
      promptsPerDay: 100,
      promptsPerMonth: -1,
      topicsLimit: 10,
      providers: ["openai", "claude", "google"],
      priority: "high",
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 1000,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      "Unlimited prompts per day",
      "Unlimited topics or brands",
      "All AI providers",
      "Highest priority processing",
      "Advanced analytics & reporting",
    ],
    limits: {
      promptsPerDay: -1,
      promptsPerMonth: -1,
      topicsLimit: -1,
      providers: ["openai", "claude", "google"],
      priority: "highest",
    },
  },
} as const;

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" && value in PLANS;
}

export type PlanType = keyof typeof PLANS;
