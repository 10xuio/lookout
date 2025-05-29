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

const getPrompt = (
  response: string,
  brandName: string,
  brandDescription: string
) => {
  return `<ROLE>
You are an expert brand mention analyst specializing in identifying and categorizing brand references in text content.
</ROLE>

<TASK>
Analyze the provided text for mentions of "${brandName}" and identify any references to this brand, related concepts, or competing brands.
</TASK>

<BRAND_CONTEXT>
Brand Name: "${brandName}"
Brand Description: "${brandDescription}"
</BRAND_CONTEXT>

<INSTRUCTIONS>
- Scan the entire text for brand mentions and related references
- Classify each mention into one of three types:
  * "direct": Explicit mention of the brand name
  * "indirect": References to brand-related concepts, products, or services without naming the brand
  * "competitive": Mentions of competing brands in the same industry/category
- For each mention, extract:
  * mentionType: The classification (direct/indirect/competitive)
  * position: The ordinal position of this mention in the text (1 for first, 2 for second, etc.)
  * context: Up to 100 characters of surrounding text for context
  * sentiment: Analyze the tone (positive/negative/neutral)
  * confidence: Your confidence score from 0.0 to 1.0
  * extractedText: The exact text that constitutes the mention
  * competitorName: If competitive mention, the competitor's name (null otherwise)
- Return ALL mentions found, even if confidence is low
- Be thorough and don't miss subtle references
</INSTRUCTIONS>

<EXAMPLES>
Text: "I love using Google for search, but Bing has improved lately."
Brand: "Google"
Result: [
  {
    "mentionType": "direct",
    "position": 1,
    "context": "I love using Google for search",
    "sentiment": "positive",
    "confidence": 1.0,
    "extractedText": "Google",
    "competitorName": null
  },
  {
    "mentionType": "competitive",
    "position": 2,
    "context": "but Bing has improved lately",
    "sentiment": "positive",
    "confidence": 0.9,
    "extractedText": "Bing",
    "competitorName": "Bing"
  }
]

Text: "The electric vehicle market is dominated by one company, though traditional automakers are catching up."
Brand: "Tesla"
Result: [
  {
    "mentionType": "indirect",
    "position": 1,
    "context": "The electric vehicle market is dominated by one company",
    "sentiment": "neutral",
    "confidence": 0.7,
    "extractedText": "electric vehicle market is dominated by one company",
    "competitorName": null
  }
]
</EXAMPLES>

<TEXT_TO_ANALYZE>
${response}
</TEXT_TO_ANALYZE>`;
};

async function detectMentionsInResponse(
  response: string,
  brandName: string,
  brandDescription: string
): Promise<DetectedMention[]> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MentionSchema,
      prompt: getPrompt(response, brandName, brandDescription),
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
