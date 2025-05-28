import { prompts, topics } from "@/db/schema";

export type Topic = Pick<
  typeof topics.$inferSelect,
  "id" | "name" | "description" | "logo" | "isActive"
> & {
  prompts?: (typeof prompts.$inferSelect)[];
};
