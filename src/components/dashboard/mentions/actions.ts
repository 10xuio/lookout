"use server";

import { db } from "@/db";
import { prompts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/auth/server";

export async function analyzeMentions() {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      }/api/analyze-mentions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: await getCookieHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error ?? "Failed to start analysis");
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message ?? "Mention analysis started in background",
    };
  } catch (error) {
    console.error("Failed to start mention analysis:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to start analysis",
    };
  }
}

async function getCookieHeader() {
  if (typeof window !== "undefined") return "";

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return cookieStore.toString();
}

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
