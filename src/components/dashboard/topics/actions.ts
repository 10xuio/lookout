import { db } from "@/db";
import { topics } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getUser } from "@/auth/server";
import type { Topic } from "@/types/topic";
import { revalidatePath } from "next/cache";

export async function getTopics(): Promise<Topic[]> {
  try {
    const topicsData = await db.query.topics.findMany({
      orderBy: desc(topics.createdAt),
    });

    return topicsData;
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return [];
  }
}

function extractDomainFromUrl(url: string): string {
  try {
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

// FIX: this is not working
async function fetchMetaDescription(url: string): Promise<string> {
  try {
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(urlWithProtocol, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TopicBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error("Failed to fetch");

    const html = await response.text();
    const metaMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i
    );

    return metaMatch?.[1] || `Website for ${extractDomainFromUrl(url)}`;
  } catch {
    return `Website for ${extractDomainFromUrl(url)}`;
  }
}

export interface CreateTopicFromUrlData {
  url: string;
}

export async function createTopicFromUrl(
  data: CreateTopicFromUrlData
): Promise<{ success: boolean; topicId?: string; error?: string }> {
  try {
    const user = await getUser();
    if (!user) throw new Error("User not found");

    const domain = extractDomainFromUrl(data.url);
    const name = domain.split(".")[0];
    const description = await fetchMetaDescription(data.url);

    const [newTopic] = await db
      .insert(topics)
      .values({
        name,
        logo: domain,
        description,
        userId: user.id,
      })
      .returning({ id: topics.id });

    revalidatePath("/dashboard/topics");

    return {
      success: true,
      topicId: newTopic.id,
    };
  } catch (error) {
    console.error("Failed to create topic:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
