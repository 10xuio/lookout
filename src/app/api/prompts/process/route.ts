import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { waitUntil } from "@vercel/functions";
import { processInBackground } from "@/lib/background/rankings";

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

    // TODO: work out a better strategy for background processing
    waitUntil(
      processInBackground(
        promptId,
        prompt.content,
        prompt.geoRegion,
        prompt.topic?.name ?? ""
      )
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
