CREATE TYPE "public"."plan" AS ENUM('free', 'basic', 'pro', 'enterprise');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'free'::"public"."plan";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";