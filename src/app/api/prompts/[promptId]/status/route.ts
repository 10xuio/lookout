import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
    const { promptId } = await params;

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    const prompt = await db.query.prompts.findFirst({
      where: eq(prompts.id, promptId),
      columns: {
        id: true,
        status: true,
        updatedAt: true,
        completedAt: true,
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return NextResponse.json({
      promptId: prompt.id,
      status: prompt.status,
      updatedAt: prompt.updatedAt,
      completedAt: prompt.completedAt,
    });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
