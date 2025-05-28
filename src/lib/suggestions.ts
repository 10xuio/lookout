import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const promptSuggestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  description: z.string().optional(),
});

const promptSuggestionsSchema = z.object({
  suggestions: z.array(promptSuggestionSchema),
});

const topicSuggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
});

const topicSuggestionsSchema = z.object({
  suggestions: z.array(topicSuggestionSchema),
});

export type PromptSuggestion = z.infer<typeof promptSuggestionSchema>;
export type TopicSuggestion = z.infer<typeof topicSuggestionSchema>;

export async function generatePromptSuggestions(
  topicName: string,
  topicDescription?: string
): Promise<PromptSuggestion[]> {
  try {
    const prompt = `<ROLE>
  You are an SEO strategist who creates realistic AI search phrases that surface a target brand without explicitly naming it.
</ROLE>

<TASK>
  Produce 5 search query suggestions that could lead a searcher to discover the target brand in the results while NOT containing the brand name.
  TARGET BRAND: "${topicName}"
  ${topicDescription ? `BRAND CONTEXT: ${topicDescription}` : ""}
</TASK>

<INSTRUCTIONS>
  - Return an object that follows this schema:
      { "suggestions": [ { "id": "prompt_1", "content": "...", "description": "..." }, ... ] }
  - Each query must:
      • Contain 2-6 natural-language words.  
      • Show commercial or investigational intent (“best”, “top”, “vs”, “affordable”, etc.).  
      • Avoid any direct mention or variation of "${topicName}".  
      • Vary angles (features, comparisons, use-cases, locations).
  - Keep each description to 20-40 words explaining the competitive insight.
</INSTRUCTIONS>

<EXAMPLES>
  TARGET BRAND: "Tesla"
  VALID QUERIES:
    • "top electric cars in the US"
    • "best self driving car 2024"
    • "luxury ev with long range"
    • "affordable electric suv"
    • "electric car over the air updates"
</EXAMPLES>`;

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      schema: promptSuggestionsSchema,
      maxTokens: 2000,
    });

    return result.object.suggestions;
  } catch (error) {
    console.error("Failed to generate prompt suggestions:", error);
    return [];
  }
}

export async function generateTopicSuggestions(
  userContext?: string
): Promise<TopicSuggestion[]> {
  try {
    const prompt = `<ROLE>
      You are a market analyst selecting brands for competitive SEO analysis in the \"Lookout\" tool.
    </ROLE>

    <TASK>
      Provide 8 diverse brand/company suggestions that meet the criteria below.${
        userContext ? ` USER CONTEXT: ${userContext}` : ""
      }
    </TASK>

    <INSTRUCTIONS>
      - Return an object shaped like:
          { "suggestions": [ { "id": "topic_1", "name": "...", "description": "...", "category": "..." }, ... ] }
      - For each suggestion follow:
          • id format "topic_#" counting from 1.  
          • name: well-known searchable brand (no duplicates).  
          • description: 30-50 words on why the brand is interesting to analyze competitively.  
          • category: succinct primary industry/sector.  
      - Selection criteria:
          • Mix B2B & B2C across multiple industries.  
          • Include market leaders & emerging disruptors with varied company sizes and business models.  
          • Prioritize brands with strong digital/search presence and active competition in crowded markets.  
    </INSTRUCTIONS>

    <EXAMPLES>
      USER CONTEXT: "online payments"
      VALID SUGGESTIONS:
        [
          { "id":"topic_1", "name":"Stripe", "description":"Stripe dominates developer-friendly payment APIs but faces intensifying competition...", "category":"Financial Services" },
          { "id":"topic_2", "name":"Square", "description":"Square blends in-person POS with e-commerce, offering a contrasting SEO footprint...", "category":"Financial Services" },
          { "id":"topic_3", "name":"Adyen", "description":"Adyen serves enterprise merchants globally, giving insight into cross-border SEO strategies...", "category":"Financial Services" }
        ]
    </EXAMPLES>`;

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      schema: topicSuggestionsSchema,
      maxTokens: 2000,
    });

    return result.object.suggestions;
  } catch (error) {
    console.error("Failed to generate topic suggestions:", error);
    return [];
  }
}
