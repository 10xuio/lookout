import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  numeric,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { SearchResult, Source } from "@/lib/llm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => !1)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo"),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const modelEnum = pgEnum("model", ["openai", "claude", "google"]);

export const geoRegionEnum = pgEnum("geo_region", [
  "global",
  "us",
  "eu",
  "uk",
  "de",
  "fr",
  "es",
  "it",
  "in",
  "jp",
  "cn",
  "au",
  "ca",
  "br",
]);

export const status = pgEnum("prompt_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const mentionTypeEnum = pgEnum("mention_type", [
  "direct",
  "indirect",
  "competitive",
]);
export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "negative",
  "neutral",
]);

export type modelStatus = "pending" | "processing" | "completed" | "failed";

export const prompts = pgTable("prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: status("status").notNull().default("pending"),
  geoRegion: geoRegionEnum("geo_region").notNull().default("global"),
  visibilityScore: numeric("visibility_score", { precision: 5, scale: 2 }),
  tags: jsonb("tags").notNull().$type<string[]>().default([]),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const modelResults = pgTable(
  "prompt_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    model: modelEnum("model").notNull(),
    responseMetadata: jsonb("response_metadata").notNull().default({}),
    status: status("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    results: jsonb("results").notNull().$type<SearchResult[]>().default([]),
    sources: jsonb("sources").$type<Source[]>().default([]),
    citations: jsonb("citations")
      .$type<
        Array<{
          text: string;
          sourceIndices: number[];
          confidence?: number;
        }>
      >()
      .default([]),
    searchQueries: jsonb("search_queries").$type<string[]>().default([]),
    groundingMetadata: jsonb("grounding_metadata").default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    unique("ai_model_results_prompt_model_unique").on(
      table.promptId,
      table.model
    ),
  ]
);

export const mentions = pgTable("mentions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => prompts.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  modelResultId: uuid("model_result_id")
    .notNull()
    .references(() => modelResults.id, { onDelete: "cascade" }),
  model: modelEnum("model").notNull(),
  mentionType: mentionTypeEnum("mention_type").notNull(),
  position: numeric("position"), // Position in the response (1st, 2nd, etc.)
  context: text("context").notNull(), // The surrounding text context
  sentiment: sentimentEnum("sentiment").notNull(),
  confidence: numeric("confidence", { precision: 3, scale: 2 }), // AI confidence in the mention
  extractedText: text("extracted_text").notNull(), // The actual mention text
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const topicsRelations = relations(topics, ({ many }) => ({
  prompts: many(prompts),
  mentions: many(mentions),
}));

export const userRelations = relations(user, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ many, one }) => ({
  modelResults: many(modelResults),
  mentions: many(mentions),
  topic: one(topics, {
    fields: [prompts.topicId],
    references: [topics.id],
  }),
}));

export const modelResultsRelations = relations(modelResults, ({ one }) => ({
  prompt: one(prompts, {
    fields: [modelResults.promptId],
    references: [prompts.id],
  }),
}));

export const mentionsRelations = relations(mentions, ({ one }) => ({
  prompt: one(prompts, {
    fields: [mentions.promptId],
    references: [prompts.id],
  }),
  topic: one(topics, {
    fields: [mentions.topicId],
    references: [topics.id],
  }),
  modelResult: one(modelResults, {
    fields: [mentions.modelResultId],
    references: [modelResults.id],
  }),
}));
