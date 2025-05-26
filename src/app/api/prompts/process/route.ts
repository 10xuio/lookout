import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts, modelResults } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const prompt = await db.query.prompts.findFirst({
      where: eq(prompts.id, promptId),
      with: {
        topic: true,
      },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found or not pending" },
        { status: 404 }
      );
    }

    await db
      .update(prompts)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, promptId));

    try {
      const results = await processPromptWithAllProviders(
        prompt.content,
        prompt.topic.name
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
      }

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
