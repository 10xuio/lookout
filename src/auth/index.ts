import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { db } from "@/db";

type UserSchema = typeof schema.user.$inferSelect;
export type User = Omit<UserSchema, "image"> & {
  image?: string | null | undefined;
};

export const auth = betterAuth({
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      stripeSubscriptionId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      stripePriceId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      stripeCurrentPeriodEnd: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      planStatus: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
});
