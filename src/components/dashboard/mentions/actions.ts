"use server";

import { db } from "@/db";
import { prompts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/auth/server";

export async function getMentions({ topicId }: { topicId?: string }) {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    const userPrompts = await db.query.prompts.findMany({
      where: and(
        eq(prompts.userId, user.id),
        ...(topicId ? [eq(prompts.topicId, topicId)] : [])
      ),
      columns: { id: true },
      with: { mentions: { with: { topic: true } } },
    });

    return userPrompts.flatMap((p) => p.mentions);
  } catch (error) {
    console.error("Failed to fetch mentions:", error);
    return [];
  }
}
