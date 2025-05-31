import { db } from "@/db";
import { user, prompts, topics } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { PLANS, PlanType } from "./stripe/server";

export interface UserSubscription {
  plan: PlanType;
  planStatus: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  limits: (typeof PLANS)[PlanType]["limits"];
}

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!dbUser) {
    return null;
  }

  const plan = (dbUser.plan as PlanType) || "free";
  const planConfig = PLANS[plan];

  return {
    plan,
    planStatus: dbUser.planStatus || "active",
    stripeCustomerId: dbUser.stripeCustomerId,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    limits: planConfig.limits,
  };
}

export async function checkUsageLimit(userId: string): Promise<{
  canProcess: boolean;
  currentUsage: number;
  limit: number;
  plan: PlanType;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      canProcess: false,
      currentUsage: 0,
      limit: 0,
      plan: "free",
    };
  }

  if (subscription.planStatus !== "active") {
    return {
      canProcess: false,
      currentUsage: 0,
      limit:
        subscription.limits.promptsPerDay ||
        subscription.limits.promptsPerMonth,
      plan: subscription.plan,
    };
  }

  if (subscription.plan === "free") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [usage] = await db
      .select({ count: count() })
      .from(prompts)
      .where(
        and(eq(prompts.userId, userId), gte(prompts.createdAt, startOfMonth))
      );

    const currentUsage = usage?.count || 0;
    const limit = subscription.limits.promptsPerMonth;

    return {
      canProcess: currentUsage < limit,
      currentUsage,
      limit,
      plan: subscription.plan,
    };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [usage] = await db
    .select({ count: count() })
    .from(prompts)
    .where(and(eq(prompts.userId, userId), gte(prompts.createdAt, startOfDay)));

  const currentUsage = usage?.count || 0;
  const limit = subscription.limits.promptsPerDay;

  return {
    canProcess: currentUsage < limit,
    currentUsage,
    limit,
    plan: subscription.plan,
  };
}

export async function getAvailableProviders(userId: string): Promise<string[]> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.planStatus !== "active") {
    return [...PLANS.free.limits.providers];
  }

  return [...subscription.limits.providers];
}

export function getProcessingPriority(plan: PlanType) {
  return PLANS[plan].limits.priority;
}

export async function checkTopicLimit(userId: string): Promise<{
  canCreateTopic: boolean;
  currentTopics: number;
  limit: number;
  plan: PlanType;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      canCreateTopic: false,
      currentTopics: 0,
      limit: 0,
      plan: "free",
    };
  }

  if (subscription.planStatus !== "active") {
    return {
      canCreateTopic: false,
      currentTopics: 0,
      limit: subscription.limits.topicsLimit,
      plan: subscription.plan,
    };
  }

  const [topicCount] = await db
    .select({ count: count() })
    .from(topics)
    .where(and(eq(topics.userId, userId), eq(topics.isActive, true)));

  const currentTopics = topicCount?.count || 0;
  const limit = subscription.limits.topicsLimit;

  return {
    canCreateTopic: currentTopics < limit,
    currentTopics,
    limit,
    plan: subscription.plan,
  };
}
