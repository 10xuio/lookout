import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withTimeout } from "@/lib/timeout";
import { getVisibilityScore } from "@/lib/utils";
import { LLMResult, Status } from "@/types/prompt";

export async function POST(request: NextRequest) {
  try {
    const { promptId } = await request.json();

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    const prompt = await db.query.prompts.findFirst({
      where: eq(prompts.id, promptId),
      with: {
        topic: true,
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.status === "processing") {
      return NextResponse.json(
        { error: "Prompt is already being processed" },
        { status: 409 }
      );
    }

    await db
      .update(prompts)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    processInBackground(
      promptId,
      prompt.content,
      prompt.geoRegion,
      prompt.topic?.name || ""
    );

    return NextResponse.json({
      success: true,
      message: "Prompt processing started",
      promptId,
      status: "processing",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function processInBackground(
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

    const dbOperations = results.map((result) => ({
      promptId,
      model: result.provider,
      response: JSON.stringify(result.response),
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
            set: {
              response: operation.response,
              responseMetadata: operation.responseMetadata,
              status: operation.status,
              errorMessage: operation.errorMessage,
              results: operation.results,
              sources: operation.sources,
              citations: operation.citations,
              searchQueries: operation.searchQueries,
              groundingMetadata: operation.groundingMetadata,
              updatedAt: new Date(),
              completedAt: operation.completedAt,
            },
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

    await db
      .update(prompts)
      .set({
        status: overallStatus,
        completedAt: new Date(),
        updatedAt: new Date(),
        visibilityScore: visibilityScore.toString(),
      })
      .where(eq(prompts.id, promptId));

    const duration = Date.now() - startTime;
    console.log(
      `Completed prompt ${promptId} in ${duration}ms. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `Error processing prompt ${promptId} after ${duration}ms:`,
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
