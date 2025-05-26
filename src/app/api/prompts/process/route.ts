import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts, modelResults, topics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { processPromptWithAllProviders } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { promptId } = await request.json();

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    // Get the prompt with its topic
    const promptWithTopic = await db
      .select({
        prompt: prompts,
        topic: topics,
      })
      .from(prompts)
      .innerJoin(topics, eq(prompts.topicId, topics.id))
      .where(and(eq(prompts.id, promptId), eq(prompts.status, "pending")))
      .limit(1);

    if (promptWithTopic.length === 0) {
      return NextResponse.json(
        { error: "Prompt not found or not pending" },
        { status: 404 }
      );
    }

    const { prompt, topic } = promptWithTopic[0];

    // Update prompt status to processing
    await db
      .update(prompts)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    try {
      // Process with all providers
      const results = await processPromptWithAllProviders(
        prompt.content,
        topic.name
      );

      // Store results for each provider
      for (const result of results) {
        await db
          .insert(modelResults)
          .values({
            promptId: prompt.id,
            model: result.provider,
            response: result.response,
            responseMetadata: result.metadata,
            status: result.error ? "failed" : "completed",
            errorMessage: result.error || null,
            results: [], // We'll enhance this later to extract structured data
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
      }

      // Update prompt status to completed
      await db
        .update(prompts)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId));

      return NextResponse.json({
        success: true,
        message: "Prompt processed successfully",
        results: results.length,
      });
    } catch (processingError) {
      // Update prompt status to failed
      await db
        .update(prompts)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, promptId));

      console.error("Error processing prompt:", processingError);
      return NextResponse.json(
        {
          error: "Failed to process prompt",
          details:
            processingError instanceof Error
              ? processingError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
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
