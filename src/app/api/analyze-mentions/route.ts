import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/auth/server";
import { processUserMentions } from "@/lib/background/mentions";
import { waitUntil } from "@vercel/functions";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = await request.json();

    // TODO: work out a better strategy for background processing
    waitUntil(processUserMentions(user.id, topicId));

    return NextResponse.json({
      success: true,
      message: "Mention analysis started in background",
    });
  } catch (error) {
    console.error("Failed to start mention analysis:", error);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }
}
