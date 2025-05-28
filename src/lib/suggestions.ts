import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Schema for prompt suggestions
const promptSuggestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  description: z.string().optional(),
});

const promptSuggestionsSchema = z.object({
  suggestions: z.array(promptSuggestionSchema),
});

// Schema for topic suggestions
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
    const prompt = `You are helping users create search queries for an SEO competitive analysis tool called "Lookout". This tool analyzes search engine results to help businesses understand their competitive landscape.

CONTEXT:
- Users input search queries that they want to analyze across multiple search engines
- The tool then searches Google, Bing, etc. and analyzes the top results to identify competitors, market trends, and SEO opportunities
- The queries should be things real people would actually type into Google when researching products, services, or solutions
- Results help users understand who ranks for important keywords in their industry

TARGET TOPIC: "${topicName}"
${topicDescription ? `Topic Description: ${topicDescription}` : ""}

Generate 5 search query suggestions that would be valuable for competitive analysis of this topic. Each query should:

QUERY CHARACTERISTICS:
- Be natural search phrases that real users type into Google (not technical SEO jargon)
- Focus on commercial intent, product research, or service discovery
- Include variations like "best [category]", "top [service] providers", "[problem] solutions", etc.
- Be specific enough to generate meaningful competitive insights
- Range from 2-6 words (typical search query length)
- Include both branded and non-branded search terms

EXAMPLES OF GOOD QUERIES:
- "best project management software" (not "analyze project management SEO strategies")
- "affordable web hosting providers" (not "web hosting competitive analysis")
- "Tesla vs BMW electric cars" (not "automotive industry SEO comparison")
- "small business accounting software" (not "accounting software market research")

Each suggestion should have:
- id: Use format "prompt_1", "prompt_2", etc.
- content: The actual search query (2-6 words, natural language)
- description: Brief explanation of what competitive insights this query would reveal (20-40 words)

Focus on queries that would help understand market positioning, competitor landscape, and customer search behavior for ${topicName}.`;

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
    const prompt = `You are helping users discover interesting brands and companies to analyze using "Lookout", an SEO competitive analysis tool.

CONTEXT:
- Lookout analyzes search engine results to help businesses understand their competitive landscape
- Users input brands/companies they want to research, then create search queries to analyze how these brands perform in search results
- The tool helps identify competitors, market positioning, and SEO opportunities
- Users typically analyze brands they compete with, aspire to emulate, or want to understand better

${userContext ? `User Context: ${userContext}` : ""}

Generate 8 diverse brand/company suggestions that would be valuable for competitive SEO analysis.

SELECTION CRITERIA:
- Mix of B2B and B2C companies across different industries
- Include both established market leaders and emerging/disruptive brands
- Focus on companies with strong digital presence and search visibility
- Choose brands that compete in crowded markets (more interesting competitive insights)
- Include companies known for innovative marketing or strong SEO performance
- Vary company sizes: enterprise, mid-market, and fast-growing startups
- Cover different business models: SaaS, e-commerce, services, marketplaces, etc.

INDUSTRY DIVERSITY:
- Technology (SaaS, AI, cybersecurity)
- E-commerce & Retail
- Financial Services
- Healthcare & Wellness
- Education & Learning
- Marketing & Advertising
- Travel & Hospitality
- Food & Beverage

Each suggestion should have:
- id: Use format "topic_1", "topic_2", etc.
- name: The brand/company name (well-known, searchable brand)
- description: Why this brand would be interesting to analyze competitively (30-50 words)
- category: The primary industry/sector

Focus on brands that:
1. Have interesting competitive dynamics in their market
2. Are actively competing for search visibility
3. Would provide valuable insights for SEO strategy
4. Represent different approaches to digital marketing and search presence`;

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
