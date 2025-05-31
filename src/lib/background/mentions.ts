/*
 *
 * NOTE: We need to work on a better strategy for background processing
 * This is a temporary solution to get the mentions working
 *
 */

import { db } from "@/db";
import { mentions, modelResults, prompts } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import PQueue from "p-queue";

const BATCH_SIZE = 5;
const PARALLEL_BATCHES = 3;
const MAX_RETRIES = 3;

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
  competitorName?: string | null;
};

async function acquireProcessingLock(
  userId: string,
  topicId?: string
): Promise<boolean> {
  try {
    const activeProcessing = await db.query.prompts.findFirst({
      where: and(
        eq(prompts.userId, userId),
        eq(prompts.status, "processing"),
        ...(topicId ? [eq(prompts.topicId, topicId)] : [])
      ),
    });

    return !activeProcessing;
  } catch {
    return false;
  }
}

export async function processUserMentions(userId: string, topicId?: string) {
  console.log(
    `Starting mention analysis for user: ${userId}, topic: ${topicId || "all"}`
  );

  const hasLock = await acquireProcessingLock(userId, topicId);
  if (!hasLock) {
    console.log("Another process is already running for this user/topic");
    return {
      success: false,
      error: "Processing already in progress",
    };
  }

  let promptIds: string[] = [];

  try {
    return await db.transaction(async (tx) => {
      const userPrompts = await tx.query.prompts.findMany({
        where: and(
          eq(prompts.userId, userId),
          ...(topicId ? [eq(prompts.topicId, topicId)] : [])
        ),
        columns: { id: true },
      });

      if (userPrompts.length === 0) {
        console.log("No prompts found for user");
        return { success: true, processed: 0, mentionsFound: 0 };
      }

      promptIds = userPrompts.map((p) => p.id);

      await tx
        .update(prompts)
        .set({ status: "processing", updatedAt: new Date() })
        .where(inArray(prompts.id, promptIds));

      const resultsCount = await tx
        .select({ count: sql<number>`count(*)` })
        .from(modelResults)
        .where(
          and(
            inArray(modelResults.promptId, promptIds),
            eq(modelResults.status, "completed")
          )
        );

      const totalResults = Number(resultsCount[0]?.count || 0);

      if (totalResults === 0) {
        await tx
          .update(prompts)
          .set({ status: "completed", completedAt: new Date() })
          .where(inArray(prompts.id, promptIds));

        return { success: true, processed: 0, mentionsFound: 0 };
      }

      const queue = new PQueue({
        concurrency: PARALLEL_BATCHES,
        interval: 1000,
        intervalCap: 10,
      });

      let totalProcessed = 0;
      let totalMentions = 0;
      const errors: string[] = [];

      queue.on("completed", () => {
        console.log(
          `Progress: ${totalProcessed}/${totalResults} results processed`
        );
      });

      const batchJobs = [];
      for (let offset = 0; offset < totalResults; offset += BATCH_SIZE) {
        batchJobs.push(
          queue.add(async () => {
            try {
              const results = await tx.query.modelResults.findMany({
                where: and(
                  inArray(modelResults.promptId, promptIds),
                  eq(modelResults.status, "completed")
                ),
                with: {
                  prompt: { with: { topic: true } },
                },
                limit: BATCH_SIZE,
                offset: offset,
              });

              const batchMentions: MentionInsert[] = [];

              for (const result of results) {
                if (!result.results || !result.prompt) continue;

                try {
                  const detectedMentions = await detectMentionsInResponse(
                    JSON.stringify(result.results),
                    result.prompt.topic.name,
                    result.prompt.topic.description ?? ""
                  );

                  const mappedMentions = detectedMentions.map((mention) => ({
                    promptId: result.promptId,
                    topicId: result.prompt.topicId,
                    modelResultId: result.id,
                    model: result.model,
                    mentionType: mention.mentionType,
                    position: mention.position.toString(),
                    context: mention.context,
                    sentiment: mention.sentiment,
                    confidence: mention.confidence.toFixed(2),
                    extractedText: mention.extractedText,
                    competitorName: mention.competitorName,
                  }));

                  batchMentions.push(...mappedMentions);
                } catch (error) {
                  console.error(`Error processing result ${result.id}:`, error);
                }
              }

              await tx
                .delete(mentions)
                .where(inArray(mentions.promptId, promptIds));

              const INSERT_CHUNK_SIZE = 100;
              for (
                let i = 0;
                i < batchMentions.length;
                i += INSERT_CHUNK_SIZE
              ) {
                const chunk = batchMentions.slice(i, i + INSERT_CHUNK_SIZE);
                await tx.insert(mentions).values(chunk);
                totalMentions += chunk.length;
              }

              totalProcessed += results.length;
            } catch (error) {
              errors.push(`Batch error at offset ${offset}: ${error}`);
            }
          })
        );
      }

      await Promise.all(batchJobs);

      await tx
        .update(prompts)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(prompts.id, promptIds));

      console.log(
        `Completed: ${totalProcessed} results, ${totalMentions} mentions, ${errors.length} errors`
      );

      if (errors.length === 0) revalidatePath("/dashboard/mentions");

      return {
        success: errors.length === 0,
        processed: totalProcessed,
        mentionsFound: totalMentions,
        errors: errors.length > 0 ? errors : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to analyze mentions:", error);

    if (promptIds.length > 0) {
      try {
        await db
          .update(prompts)
          .set({ status: "failed", updatedAt: new Date() })
          .where(inArray(prompts.id, promptIds));
      } catch (resetError) {
        console.error("Failed to reset prompt status:", resetError);
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processed: 0,
      mentionsFound: 0,
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
- Focus on finding high-confidence mentions first
- Classify each mention as: direct (explicit brand name), indirect (related concepts), or competitive (competitor brands)
- Extract mentions with surrounding context (up to 100 chars)
- Assess sentiment accurately: positive, negative, or neutral
- For competitive mentions, identify the competitor name
- Return empty array if no mentions found
- Limit analysis to first 10 high-quality mentions to optimize performance
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
      temperature: 0.1,
      maxTokens: 1000,
    });

    const validMentions = (object.mentions || []).filter(
      (mention) =>
        mention.confidence >= 0.3 &&
        mention.extractedText &&
        mention.extractedText.length > 0
    );

    return validMentions;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(
        `Retrying mention detection (attempt ${
          retryCount + 1
        }/${MAX_RETRIES}) after ${delay}ms`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

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
