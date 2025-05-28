import { Prompt, Region } from "@/types/prompt";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { getUser } from "@/auth/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

export async function deletePrompt(promptId: string) {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    await db
      .delete(prompts)
      .where(and(eq(prompts.id, promptId), eq(prompts.userId, user.id)));

    revalidatePath("/dashboard/rankings");
  } catch (error) {
    console.error("Failed to delete prompt:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getPrompts(topicId?: string): Promise<Prompt[]> {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    const promptsWithResults = await db.query.prompts.findMany({
      where: topicId
        ? and(eq(prompts.userId, user.id), eq(prompts.topicId, topicId))
        : eq(prompts.userId, user.id),
      with: {
        modelResults: true,
        topic: true,
      },
    });

    const transformedPrompts: Prompt[] = promptsWithResults.map((prompt) => {
      const allResults = prompt.modelResults.flatMap(
        (result) => result.results ?? []
      );

      return {
        id: prompt.id,
        content: prompt.content,
        visibilityScore: prompt.visibilityScore,
        tags: prompt.tags ?? [],
        geoRegion: prompt.geoRegion,
        completedAt: prompt.completedAt,
        status: prompt.status,
        top: allResults,
        modelResults: prompt.modelResults,
      };
    });

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
