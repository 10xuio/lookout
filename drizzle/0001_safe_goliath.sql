ALTER TABLE "prompt_results" ADD COLUMN "sources" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "prompt_results" ADD COLUMN "citations" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "prompt_results" ADD COLUMN "search_queries" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "prompt_results" ADD COLUMN "grounding_metadata" jsonb DEFAULT '{}'::jsonb;