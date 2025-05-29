import { mentions } from "@/db/schema";
import { Topic } from "./topic";

export type Mention = Pick<
  typeof mentions.$inferSelect,
  | "id"
  | "promptId"
  | "topicId"
  | "modelResultId"
  | "model"
  | "mentionType"
  | "position"
  | "context"
  | "sentiment"
  | "confidence"
  | "extractedText"
  | "createdAt"
> & {
  topic: Topic;
};
