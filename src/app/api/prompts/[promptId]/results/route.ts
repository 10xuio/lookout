import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { modelResults } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const { promptId } = params;

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    const results = await db
      .select({
        id: modelResults.id,
        model: modelResults.model,
        response: modelResults.response,
        status: modelResults.status,
        errorMessage: modelResults.errorMessage,
        completedAt: modelResults.completedAt,
      })
      .from(modelResults)
      .where(eq(modelResults.promptId, promptId));

    return NextResponse.json({ results });
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
