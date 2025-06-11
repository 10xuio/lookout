/*
 *
 * NOTE: We need to work on a better strategy for background processing
 * This is a temporary solution to get the mentions working
 *
 */

import { db } from "@/db";
import { withTimeout } from "../timeout";
import { Status } from "@/types/prompt";
import { LLMResult } from "@/types/prompt";
import { getVisibilityScore } from "../utils";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function processInBackground(
  promptId: string,
  content: string,
  geoRegion: string,
  topicName: string
) {
  const startTime = Date.now();

  try {
    const [{ processPromptWithAllProviders }, { modelResults }] =
      await Promise.all([import("@/lib/llm"), import("@/db/schema")]);

    const results = await withTimeout(
      processPromptWithAllProviders(content, geoRegion),
      180000,
      `Processing timeout for prompt ${promptId}`
    );

    const successfulResults = results.filter(result => !result.error);

    const dbOperations = results.map((result) => ({
      promptId,
      model: result.provider,
      responseMetadata: result.metadata,
      status: result.error ? "failed" : ("completed" as Status),
      errorMessage: result.error ?? null,
      results: result.response,
      sources: result.sources ?? [],
      citations: result.citations ?? [],
      searchQueries: result.searchQueries ?? [],
      groundingMetadata: result.groundingMetadata ?? {},
      completedAt: new Date(),
    }));

    const dbResults = await Promise.allSettled(
      dbOperations.map((operation) =>
        db
          .insert(modelResults)
          .values(operation)
          .onConflictDoUpdate({
            target: [modelResults.promptId, modelResults.model],
            set: { ...operation, updatedAt: new Date() },
          })
          .returning()
      )
    );

    const { successCount, failureCount, allResults } = dbResults.reduce(
      (acc, result, index) => {
        if (result.status === "fulfilled") {
          acc.successCount++;
          acc.allResults.push(...result.value);
        } else {
          acc.failureCount++;
          console.error(
            `DB error for ${results[index].provider}:`,
            result.reason
          );
        }
        return acc;
      },
      { successCount: 0, failureCount: 0, allResults: [] as LLMResult[] }
    );

    const overallStatus = successCount > 0 ? "completed" : "failed";
    const visibilityScore = getVisibilityScore(allResults, topicName);

    console.log(
      `Prompt ${promptId} processing summary: ${successCount} successful, ${failureCount} failed providers`
    );

    await db
      .update(prompts)
      .set({
        status: overallStatus,
        completedAt: new Date(),
        updatedAt: new Date(),
        visibilityScore: visibilityScore.toString(),
      })
      .where(eq(prompts.id, promptId));

    console.log(
      `Completed prompt ${promptId} in ${
        Date.now() - startTime
      }ms. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    console.error(
      `Error processing prompt ${promptId} after ${Date.now() - startTime}ms:`,
      error
    );

    await db
      .update(prompts)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId))
      .catch((dbError) =>
        console.error(`Failed to update status for ${promptId}:`, dbError)
      );
  }
}
