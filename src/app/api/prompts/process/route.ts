import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { waitUntil } from "@vercel/functions";
import { processInBackground } from "@/lib/background/rankings";
import { checkUsageLimit } from "@/lib/subscription";
import { getUser } from "@/auth/server";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { promptId } = await request.json();

    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    const usageCheck = await checkUsageLimit(authUser.id);

    if (!usageCheck.canProcess) {
      const message =
        usageCheck.limit === -1
          ? "Your subscription is not active"
          : `Usage limit exceeded. You've used ${usageCheck.currentUsage}/${usageCheck.limit} prompts this month. Upgrade your plan to process more prompts.`;

      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          message,
          currentUsage: usageCheck.currentUsage,
          limit: usageCheck.limit,
          plan: usageCheck.plan,
        },
        { status: 403 }
      );
    }

    const prompt = await db.query.prompts.findFirst({
      where: and(eq(prompts.id, promptId), eq(prompts.userId, authUser.id)),
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
      usage: {
        current: usageCheck.currentUsage + 1,
        limit: usageCheck.limit,
        plan: usageCheck.plan,
      },
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
