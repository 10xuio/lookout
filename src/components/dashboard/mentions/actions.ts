import { db } from "@/db";
import { mentions, modelResults, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/server";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const MentionSchema = z.object({
  mentions: z.array(
    z.object({
      mentionType: z.enum(["direct", "indirect", "competitive"]),
      position: z.number(),
      context: z.string(),
      sentiment: z.enum(["positive", "negative", "neutral"]),
      confidence: z.number(),
      extractedText: z.string(),
      competitorName: z.string().nullable().optional(),
    })
  ),
});

interface DetectedMention {
  mentionType: "direct" | "indirect" | "competitive";
  position: number;
  context: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  extractedText: string;
  competitorName?: string | null;
}

export async function analyzeMentions() {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    const results = await db.query.modelResults.findMany({
      where: eq(modelResults.status, "completed"),
      with: {
        prompt: {
          with: {
            topic: true,
          },
        },
      },
    });

    await db.delete(mentions);

    let totalProcessed = 0;
    let totalMentions = 0;

    for (const result of results) {
      if (!result.response || !result.prompt) continue;

      const detectedMentions = await detectMentionsInResponse(
        result.response,
        result.prompt.topic.name,
        result.prompt.topic.description || ""
      );

      // Store detected mentions
      for (const mention of detectedMentions) {
        await db.insert(mentions).values({
          promptId: result.promptId,
          topicId: result.prompt.topicId,
          modelResultId: result.id,
          model: result.model,
          mentionType: mention.mentionType,
          position: mention.position.toString(),
          context: mention.context,
          sentiment: mention.sentiment,
          confidence: mention.confidence.toString(),
          extractedText: mention.extractedText,
        });
        totalMentions++;
      }

      totalProcessed++;
    }

    revalidatePath("/dashboard/mentions");

    return {
      success: true,
      processed: totalProcessed,
      mentionsFound: totalMentions,
    };
  } catch (error) {
    console.error("Failed to analyze mentions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function detectMentionsInResponse(
  response: string,
  brandName: string,
  brandDescription: string
): Promise<DetectedMention[]> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MentionSchema,
      prompt: `You are an expert at analyzing text for brand mentions. Analyze the given response for mentions of the specified brand or related competitors.

Brand to analyze: "${brandName}"
Brand description: "${brandDescription}"

For each mention found, determine:
1. mentionType: "direct" (explicit brand mention), "indirect" (related/contextual), or "competitive" (competitor mentioned)
2. position: numerical position in the response (1st, 2nd, etc.)
3. context: surrounding text (max 100 chars)
4. sentiment: "positive", "negative", or "neutral"
5. confidence: 0.0-1.0 confidence score
6. extractedText: the exact mention text
7. competitorName: if competitive mention, the competitor name

Analyze this response for mentions of "${brandName}":

${response}`,
    });

    return object.mentions || [];
  } catch (error) {
    console.error("Error detecting mentions:", error);
    return [];
  }
}

export async function getMentions() {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  try {
    const userPrompts = await db.query.prompts.findMany({
      where: eq(prompts.userId, user.id),
      columns: { id: true },
      with: {
        mentions: {
          with: {
            topic: true,
          },
        },
      },
    });

    return userPrompts.flatMap((p) => p.mentions);
  } catch (error) {
    console.error("Failed to fetch mentions:", error);
    return [];
  }
}
