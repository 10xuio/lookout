import { db } from "@/db";
import { mentions, modelResults, prompts } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

type MentionInsert = {
  promptId: string;
  topicId: string;
  modelResultId: string;
  model: "openai" | "claude" | "google";
  mentionType: "direct" | "indirect" | "competitive";
  position: string;
  context: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: string;
  extractedText: string;
};

export async function processUserMentions(userId: string) {
  console.log(`Starting mention analysis for user: ${userId}`);

  try {
    const userPrompts = await db.query.prompts.findMany({
      where: eq(prompts.userId, userId),
      columns: { id: true },
    });

    if (userPrompts.length === 0) {
      console.log("No prompts found for user");
      return {
        success: true,
        processed: 0,
        mentionsFound: 0,
      };
    }

    const promptIds = userPrompts.map((p) => p.id);

    const results = await db.query.modelResults.findMany({
      where: and(
        inArray(modelResults.promptId, promptIds),
        eq(modelResults.status, "completed")
      ),
      with: {
        prompt: {
          with: {
            topic: true,
          },
        },
      },
    });

    if (results.length === 0) {
      console.log("No completed results found for user");
      return {
        success: true,
        processed: 0,
        mentionsFound: 0,
      };
    }

    await db.delete(mentions).where(inArray(mentions.promptId, promptIds));

    let totalProcessed = 0;
    let totalMentions = 0;
    const mentionsToInsert: MentionInsert[] = [];

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (result) => {
        if (!result.response || !result.prompt) return [];

        try {
          const detectedMentions = await detectMentionsInResponse(
            result.response,
            result.prompt.topic.name,
            result.prompt.topic.description || ""
          );

          return detectedMentions.map((mention) => ({
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
          }));
        } catch (error) {
          console.error(`Error processing result ${result.id}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const batchMentions = batchResults.flat();

      mentionsToInsert.push(...batchMentions);
      totalProcessed += batch.length;

      console.log(
        `Processed batch ${Math.floor(i / BATCH_SIZE) + 1}, found ${
          batchMentions.length
        } mentions`
      );
    }

    if (mentionsToInsert.length > 0) {
      const INSERT_CHUNK_SIZE = 100;
      for (let i = 0; i < mentionsToInsert.length; i += INSERT_CHUNK_SIZE) {
        const chunk = mentionsToInsert.slice(i, i + INSERT_CHUNK_SIZE);
        await db.insert(mentions).values(chunk);
      }
      totalMentions = mentionsToInsert.length;
    }

    console.log(
      `Completed mention analysis for user ${userId}: ${totalProcessed} results, ${totalMentions} mentions found`
    );

    revalidatePath("/dashboard/mentions");

    return {
      success: true,
      processed: totalProcessed,
      mentionsFound: totalMentions,
    };
  } catch (error) {
    console.error("Failed to analyze mentions:", error);
    throw error;
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

<TEXT_TO_ANALYZE>
${response}
</TEXT_TO_ANALYZE>`;
};

async function detectMentionsInResponse(
  response: string,
  brandName: string,
  brandDescription: string,
  retryCount = 0
): Promise<DetectedMention[]> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MentionSchema,
      prompt: getPrompt(response, brandName, brandDescription),
    });

    return object.mentions || [];
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying mention detection (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      return detectMentionsInResponse(
        response,
        brandName,
        brandDescription,
        retryCount + 1
      );
    }
    console.error("Error detecting mentions after retries:", error);
    return [];
  }
}
