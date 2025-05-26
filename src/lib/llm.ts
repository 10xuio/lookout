import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
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
      model: openai("gpt-4o"),
      prompt: searchPrompt,
      maxTokens: 1000,
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
      model: google("gemini-1.5-pro", {
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
    const searchPrompt = createSearchPrompt(prompt, topicName);

    const result = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: searchPrompt,
      maxTokens: 1000,
    });

    return {
      provider: "claude",
      response: result.text,
      metadata: {
        usage: result.usage,
        finishReason: result.finishReason,
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
