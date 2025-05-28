import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { Anthropic } from "@anthropic-ai/sdk";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export type LLMProvider = "openai" | "claude" | "google";

// Enhanced source schema with additional metadata
export const sourceSchema = z.object({
  title: z.string().describe("Title of the source"),
  url: z.string().describe("URL of the source"),
  snippet: z.string().describe("Snippet about the source"),
  domain: z.string().optional().describe("Domain of the source"),
  publishedDate: z.string().optional().describe("Published date if available"),
  confidence: z
    .number()
    .optional()
    .describe("Confidence score for this source"),
});

// Enhanced search result schema
const resultSchema = z.object({
  title: z.string().describe("Title of the brand/topic"),
  url: z
    .string()
    .describe(
      "URL of the brand/topic it must be a top level domain and not a subdomain or a path"
    ),
  snippet: z
    .string()
    .describe(
      "Snippet about the brand/topic in 100 words MAXIMUM based on the prompt and the search results"
    ),
});

const searchResultsSchema = z.array(resultSchema);

export type SearchResult = z.infer<typeof resultSchema>;
export type Source = z.infer<typeof sourceSchema>;

// Enhanced LLM response interface
export interface LLMResponse {
  provider: LLMProvider;
  response: SearchResult[];
  metadata: Record<string, unknown>;
  error?: string;
  // Enhanced fields for sources and citations
  sources?: Source[];
  citations?: Array<{
    text: string;
    sourceIndices: number[];
    confidence?: number;
  }>;
  searchQueries?: string[];
  groundingMetadata?: Record<string, unknown>;
}

const schemaDescription = {
  title: "Title of the brand/topic",
  url: "URL of the brand/topic it must be a top level domain and not a subdomain or a path",
  snippet:
    "Snippet about the brand/topic in 100 words MAXIMUM based on the prompt and the search results",
};

function createSearchPrompt(originalPrompt: string, region: string): string {
  return `<ROLE>
  You are a helpful assistant that can search the web and analyze information based on the prompt and the user location.
</ROLE>

<TASK>
  Search and analyze information for: "${originalPrompt}"
</TASK>

<USER_LOCATION>
  The user location is: "${region}"
</USER_LOCATION>

<INSTRUCTIONS>
  - You must only return information in the format of a array of JSON objects.
  - You must only return information that is relevant to the prompt and the user location.
  - Each object must have the following keys:
    - title: Title of the brand/topic
    - url: string (the URL of the brand/topic) it must be a top level domain and not a subdomain or a path
    - snippet: string (the snippet of the brand/topic in 100 words MAXIMUM based on the prompt and the search results)
  - We are only going to return one object per brand/topic, no other text or formatting
</INSTRUCTIONS>

<EXAMPLES>
  PROMPT: "top 3 search engines"
  RESPONSE: [
    {
      "title": "Google",
      "url": "https://www.google.com",
      "snippet": "Google is a search engine"
    },
    {
      "title": "Bing",
      "url": "https://www.bing.com",
      "snippet": "Bing is a search engine"
    },
    {
      "title": "DuckDuckGo",
      "url": "https://www.duckduckgo.com",
      "snippet": "DuckDuckGo is a search engine"
    }
  ]

  PROMPT: "Best electric car brands in the US"
  RESPONSE: [
    {
      "title": "Tesla",
      "url": "https://www.tesla.com",
      "snippet": "Tesla is a electric car company"
    },
    {
      "title": "Lucid",
      "url": "https://www.lucid.com",
      "snippet": "Lucid is a electric car company"
    },
    {
      "title": "Rivian",
      "url": "https://www.rivian.com",
      "snippet": "Rivian is a electric car company"
    }
  ]
</EXAMPLES>
`;
}

export async function processPromptWithOpenAI(
  prompt: string,
  region: string
): Promise<LLMResponse> {
  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          userLocation: {
            region,
          },
          searchContextSize: "high",
        }),
      },
    });

    const parsed = searchResultsSchema.parse(JSON.parse(result.text));

    // Extract basic metadata - simplified to avoid TypeScript issues
    const sources: Source[] = [];
    const citations: Array<{
      text: string;
      sourceIndices: number[];
      confidence?: number;
    }> = [];
    const searchQueries: string[] = [];

    // Basic extraction without complex type checking
    try {
      const toolResults = result.toolResults as unknown[];
      if (toolResults && Array.isArray(toolResults)) {
        toolResults.forEach((toolResult: unknown) => {
          const tr = toolResult as Record<string, unknown>;
          if (tr.toolName === "web_search_preview" && tr.result) {
            const webResult = tr.result as Record<string, unknown>;

            if (webResult.query && typeof webResult.query === "string") {
              searchQueries.push(webResult.query);
            }

            if (webResult.results && Array.isArray(webResult.results)) {
              webResult.results.forEach((source: unknown) => {
                const s = source as Record<string, unknown>;
                sources.push({
                  title: (s.title as string) || "",
                  url: (s.url as string) || "",
                  snippet: (s.snippet as string) || (s.content as string) || "",
                  domain:
                    s.url && typeof s.url === "string"
                      ? new URL(s.url).hostname
                      : undefined,
                  publishedDate: s.publishedDate as string,
                  confidence: s.score as number,
                });
              });
            }
          }
        });
      }
    } catch {
      // Silently continue if extraction fails
    }

    return {
      provider: "openai",
      response: parsed,
      metadata: { result },
      sources,
      citations,
      searchQueries,
      groundingMetadata: result.toolResults as unknown as Record<
        string,
        unknown
      >,
    };
  } catch (error) {
    return {
      provider: "openai",
      response: [],
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function processPromptWithGoogle(
  prompt: string,
  region: string
): Promise<LLMResponse> {
  try {
    const result = await generateObject({
      model: google("gemini-2.5-pro-preview-05-06", {
        useSearchGrounding: true,
        structuredOutputs: true,
      }),
      maxTokens: 5000,
      output: "object",
      schema: searchResultsSchema,
      prompt,
    });

    if (!result.object) {
      throw new Error("No results found");
    }

    const parsed = searchResultsSchema.parse(result.object);

    // Extract grounding metadata from Gemini response - simplified
    const sources: Source[] = [];
    const citations: Array<{
      text: string;
      sourceIndices: number[];
      confidence?: number;
    }> = [];
    const searchQueries: string[] = [];

    try {
      const groundingMetadata = (result as unknown as Record<string, unknown>)
        .groundingMetadata as Record<string, unknown>;
      if (groundingMetadata) {
        // Extract search queries
        if (
          groundingMetadata.webSearchQueries &&
          Array.isArray(groundingMetadata.webSearchQueries)
        ) {
          searchQueries.push(
            ...(groundingMetadata.webSearchQueries as string[])
          );
        }

        // Extract grounding chunks (sources)
        if (
          groundingMetadata.groundingChunks &&
          Array.isArray(groundingMetadata.groundingChunks)
        ) {
          groundingMetadata.groundingChunks.forEach((chunk: unknown) => {
            const c = chunk as Record<string, unknown>;
            if (c.web) {
              const web = c.web as Record<string, unknown>;
              sources.push({
                title: (web.title as string) || "",
                url: (web.uri as string) || "",
                snippet: (c.snippet as string) || "",
                domain: web.title as string,
                confidence: c.confidence as number,
              });
            }
          });
        }

        // Extract grounding supports (citations)
        if (
          groundingMetadata.groundingSupports &&
          Array.isArray(groundingMetadata.groundingSupports)
        ) {
          groundingMetadata.groundingSupports.forEach((support: unknown) => {
            const s = support as Record<string, unknown>;
            const segment = s.segment as Record<string, unknown>;
            citations.push({
              text: (segment?.text as string) || "",
              sourceIndices: (s.groundingChunkIndices as number[]) || [],
              confidence: Array.isArray(s.confidenceScores)
                ? (s.confidenceScores[0] as number)
                : undefined,
            });
          });
        }
      }
    } catch {
      // Silently continue if extraction fails
    }

    return {
      provider: "google",
      response: parsed,
      metadata: { result, region },
      sources,
      citations,
      searchQueries,
      groundingMetadata: (result as unknown as Record<string, unknown>)
        .groundingMetadata as Record<string, unknown>,
    };
  } catch (error) {
    return {
      provider: "google",
      response: [],
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const claudeSchema = {
  type: "object" as const,
  properties: {
    results: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: {
            type: "string" as const,
            description: schemaDescription.title,
          },
          url: {
            type: "string" as const,
            description: schemaDescription.url,
          },
          snippet: {
            type: "string" as const,
            description: schemaDescription.snippet,
          },
        },
        required: ["title", "url", "snippet"],
      },
    },
  },
  required: ["results"],
};

const anthropic = new Anthropic();

export async function processPromptWithClaude(
  prompt: string,
  region: string
): Promise<LLMResponse> {
  try {
    const result = await anthropic.messages.create({
      model: "claude-3-7-sonnet-latest",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 5000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          user_location: {
            type: "approximate",
            region,
          },
          max_uses: 5,
        },
        {
          name: "format_search_results",
          description: "Format search results into structured JSON",
          input_schema: claudeSchema,
        },
      ],
      tool_choice: { type: "tool", name: "format_search_results" },
    });

    const formatted = result.content.find((block) => block.type === "tool_use");

    if (!formatted || !formatted.input) {
      throw new Error("No formatted results found");
    }

    const parsed = z
      .object({
        results: searchResultsSchema,
      })
      .parse(formatted.input);

    // Extract sources and citations from Claude's response - simplified
    const sources: Source[] = [];
    const citations: Array<{
      text: string;
      sourceIndices: number[];
      confidence?: number;
    }> = [];
    const searchQueries: string[] = [];

    try {
      // Process Claude's content blocks for web search results
      result.content.forEach((block) => {
        if (block.type === "web_search_tool_result") {
          const content = block.content as unknown;
          if (Array.isArray(content)) {
            content.forEach((searchResult: unknown) => {
              const sr = searchResult as Record<string, unknown>;
              if (sr.type === "web_search_result") {
                sources.push({
                  title: (sr.title as string) || "",
                  url: (sr.url as string) || "",
                  snippet: (sr.snippet as string) || "",
                  domain:
                    sr.url && typeof sr.url === "string"
                      ? new URL(sr.url).hostname
                      : undefined,
                });
              }
            });
          }
        }

        // Extract citations from text blocks with citations
        if (block.type === "text") {
          const citations_data = (block as unknown as Record<string, unknown>)
            .citations;
          if (Array.isArray(citations_data)) {
            citations_data.forEach((citation: unknown) => {
              const c = citation as Record<string, unknown>;
              if (c.type === "web_search_result_location") {
                citations.push({
                  text: (c.cited_text as string) || "",
                  sourceIndices: [sources.length - 1], // Reference to the last added source
                });
              }
            });
          }
        }
      });
    } catch {
      // Silently continue if extraction fails
    }

    return {
      provider: "claude",
      response: parsed.results,
      metadata: { result },
      sources,
      citations,
      searchQueries,
      groundingMetadata: result.content as unknown as Record<string, unknown>,
    };
  } catch (error) {
    return {
      provider: "claude",
      response: [],
      metadata: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function processPromptWithAllProviders(
  prompt: string,
  region: string
): Promise<LLMResponse[]> {
  const searchPrompt = createSearchPrompt(prompt, region);
  const promises = [
    processPromptWithOpenAI(searchPrompt, region),
    processPromptWithGoogle(searchPrompt, region),
    processPromptWithClaude(searchPrompt, region),
  ];

  return Promise.all(promises);
}
