import { prompts, modelResults } from "@/db/schema";
import { SearchResult } from "@/lib/llm";

export type LLMResult = Pick<
  typeof modelResults.$inferSelect,
  | "id"
  | "model"
  | "response"
  | "status"
  | "errorMessage"
  | "completedAt"
  | "results"
  | "sources"
  | "citations"
  | "searchQueries"
  | "groundingMetadata"
>;

export type Prompt = Pick<
  typeof prompts.$inferSelect,
  | "id"
  | "content"
  | "visibilityScore"
  | "tags"
  | "geoRegion"
  | "completedAt"
  | "status"
> & {
  top: SearchResult[];
  results: LLMResult[];
};

export type Status =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type Region =
  | "global"
  | "us"
  | "eu"
  | "uk"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "in"
  | "jp"
  | "cn"
  | "au"
  | "ca"
  | "br";
