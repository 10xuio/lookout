import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { Anthropic } from "@anthropic-ai/sdk";
import { generateText } from "ai";

export type LLMProvider = "openai" | "claude" | "google";

export interface LLMResponse {
  provider: LLMProvider;
  response: string;
  metadata: Record<string, unknown>;
  error?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Create search-enhanced prompts for each provider
function createSearchPrompt(originalPrompt: string, topicName: string): string {
  return `Search and analyze information about "${topicName}":
${originalPrompt}`;
}

export async function processPromptWithOpenAI(
  prompt: string,
  topicName: string
): Promise<LLMResponse> {
  try {
    const searchPrompt = createSearchPrompt(prompt, topicName);

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: searchPrompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
        }),
      },
      toolChoice: { type: "tool", toolName: "web_search_preview" },
    });

    return {
      provider: "openai",
      response: result.text,
      metadata: {
        usage: result.usage,
        finishReason: result.finishReason,
      },
    };
  } catch (error) {
    return {
      provider: "openai",
      response: "",
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function processPromptWithGoogle(
  prompt: string,
  topicName: string
): Promise<LLMResponse> {
  try {
    const searchPrompt = createSearchPrompt(prompt, topicName);

    const result = await generateText({
      model: google("gemini-2.5-pro-preview-05-06", {
        useSearchGrounding: true,
      }),
      prompt: searchPrompt,
      maxTokens: 1000,
    });

    return {
      provider: "google",
      response: result.text,
      metadata: {
        usage: result.usage,
        finishReason: result.finishReason,
      },
    };
  } catch (error) {
    return {
      provider: "google",
      response: "",
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function processPromptWithClaude(
  prompt: string,
  topicName: string
): Promise<LLMResponse> {
  try {
    const anthropic = new Anthropic();
    const searchPrompt = createSearchPrompt(prompt, topicName);

    const result = await anthropic.messages.create({
      model: "claude-3-7-sonnet-latest",
      messages: [
        {
          role: "user",
          content: searchPrompt,
        },
      ],
      max_tokens: 1000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
    });

    let responseText = "";
    if (result.content && Array.isArray(result.content)) {
      responseText = result.content
        .filter(
          (block: { type: string; text?: string }) => block.type === "text"
        )
        .map((block: { type: string; text?: string }) => block.text || "")
        .join(" ");
    }

    return {
      provider: "claude",
      response: responseText,
      metadata: {
        usage: result.usage,
        finishReason: result.stop_reason,
      },
    };
  } catch (error) {
    return {
      provider: "claude",
      response: "",
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function processPromptWithAllProviders(
  prompt: string,
  topicName: string
): Promise<LLMResponse[]> {
  const promises = [
    processPromptWithOpenAI(prompt, topicName),
    processPromptWithGoogle(prompt, topicName),
    processPromptWithClaude(prompt, topicName),
  ];

  return Promise.all(promises);
}
