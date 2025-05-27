import { prompts, modelResults } from "@/db/schema";

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
  top: { name: string; logo?: string }[];
  results: (typeof modelResults.$inferSelect)[];
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
