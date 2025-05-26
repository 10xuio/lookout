import { Prompt, Region } from "@/types/prompt";
import { db } from "@/db";
import { prompts, modelResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUser } from "@/auth/server";
import { revalidatePath } from "next/cache";

export async function getPrompts(): Promise<Prompt[]> {
  try {
    const promptsWithResults = await db
      .select({
        id: prompts.id,
        content: prompts.content,
        visibilityScore: prompts.visibilityScore,
        tags: prompts.tags,
        geoRegion: prompts.geoRegion,
        completedAt: prompts.completedAt,
        status: prompts.status,
        results: modelResults.results,
      })
      .from(prompts)
      .leftJoin(modelResults, eq(prompts.id, modelResults.promptId))
      .orderBy(desc(prompts.createdAt));

    const transformedPrompts: Prompt[] = promptsWithResults.map((row) => ({
      id: row.id,
      content: row.content,
      visibilityScore: row.visibilityScore,
      tags: row.tags || [],
      geoRegion: row.geoRegion,
      completedAt: row.completedAt,
      status: row.status,
      top: row.results || [],
    }));

    return transformedPrompts;
  } catch (error) {
    console.error("Failed to fetch prompts:", error);
    return [];
  }
}

export interface CreatePromptData {
  content: string;
  topicId: string;
  geoRegion?: Region;
  tags?: string;
}

export async function createPrompt(
  data: CreatePromptData
): Promise<{ success: boolean; promptId?: string; error?: string }> {
  try {
    const user = await getUser();
    if (!user) throw new Error("User not found");

    const tags =
      data.tags
        ?.split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0) ?? [];

    const [newPrompt] = await db
      .insert(prompts)
      .values({
        content: data.content,
        topicId: data.topicId,
        userId: user.id,
        geoRegion: data.geoRegion ?? "global",
        tags,
        status: "pending",
      })
      .returning({ id: prompts.id });

    revalidatePath("/dashboard/prompts");

    return {
      success: true,
      promptId: newPrompt.id,
    };
  } catch (error) {
    console.error("Failed to create prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
