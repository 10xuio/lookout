import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withTimeout } from "@/lib/timeout";

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

    // Update status to processing immediately
    await db
      .update(prompts)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    // Trigger background processing without waiting
    processInBackground(promptId, prompt.content, prompt.topic.name);

    // Return immediately to the user
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

// Background processing function that runs independently
async function processInBackground(
  promptId: string,
  content: string,
  topicName: string
) {
  const startTime = Date.now();
  console.log(`Starting background processing for prompt ${promptId}`);

  try {
    // Dynamic import to avoid loading heavy dependencies in the main request
    const { processPromptWithAllProviders } = await import("@/lib/llm");
    const { modelResults } = await import("@/db/schema");

    console.log(`Processing prompt ${promptId} with all providers...`);
    const results = await withTimeout(
      processPromptWithAllProviders(content, topicName),
      240000, // 4 minutes timeout
      `Processing timeout for prompt ${promptId}`
    );

    let successCount = 0;
    let failureCount = 0;

    // Save results to database with individual error handling
    for (const result of results) {
      try {
        await db
          .insert(modelResults)
          .values({
            promptId,
            model: result.provider,
            response: result.response,
            responseMetadata: result.metadata,
            status: result.error ? "failed" : "completed",
            errorMessage: result.error || null,
            results: [],
            completedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [modelResults.promptId, modelResults.model],
            set: {
              response: result.response,
              responseMetadata: result.metadata,
              status: result.error ? "failed" : "completed",
              errorMessage: result.error || null,
              updatedAt: new Date(),
              completedAt: new Date(),
            },
          });

        if (result.error) {
          failureCount++;
          console.warn(
            `Provider ${result.provider} failed for prompt ${promptId}: ${result.error}`
          );
        } else {
          successCount++;
          console.log(
            `Provider ${result.provider} completed successfully for prompt ${promptId}`
          );
        }
      } catch (dbError) {
        failureCount++;
        console.error(
          `Database error saving result for provider ${result.provider}, prompt ${promptId}:`,
          dbError
        );
      }
    }

    // Determine overall status based on results
    const overallStatus = successCount > 0 ? "completed" : "failed";

    // Update prompt status
    await db
      .update(prompts)
      .set({
        status: overallStatus,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    const duration = Date.now() - startTime;
    console.log(
      `Completed processing prompt ${promptId} in ${duration}ms. Success: ${successCount}, Failed: ${failureCount}`
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `Critical error processing prompt ${promptId} after ${duration}ms:`,
      error
    );

    try {
      // Update prompt status to failed
      await db
        .update(prompts)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId));
    } catch (dbError) {
      console.error(
        `Failed to update prompt status to failed for ${promptId}:`,
        dbError
      );
    }
  }
}
