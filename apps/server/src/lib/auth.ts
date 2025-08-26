import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "cloudflare:workers";

import type { DB } from "better-auth/adapters/drizzle";
import schema from "../db/schema";
export function createAuth(db: DB) {
   return betterAuth({
      database: drizzleAdapter(db, {
         provider: "pg",

         schema: schema,
      }),
      trustedOrigins: [env.CORS_ORIGIN],
      emailAndPassword: {
         enabled: true,
      },
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      advanced: {
         defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
            httpOnly: true,
         },
      },
   });
}
export type Auth = ReturnType<typeof createAuth>;
