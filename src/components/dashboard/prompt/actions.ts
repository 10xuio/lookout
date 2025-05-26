import { Prompt, Region } from "@/types/prompt";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { getUser } from "@/auth/server";
import { revalidatePath } from "next/cache";

export async function getPrompts(): Promise<Prompt[]> {
  try {
    const promptsWithResults = await db.query.prompts.findMany({
      with: {
        modelResults: true,
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
        tags: prompt.tags || [],
        geoRegion: prompt.geoRegion,
        completedAt: prompt.completedAt,
        status: prompt.status,
        top: allResults,
        results: prompt.modelResults,
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
