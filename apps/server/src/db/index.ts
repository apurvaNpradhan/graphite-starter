/* import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "cloudflare:workers";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const sql = neon(env.HYPERDRIVE.connectionString || "");
export const db = drizzle(sql);
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "./schema";
export function createDb(db: Hyperdrive) {
   const client = postgres(db.connectionString, {
      max: 1,
      connect_timeout: 10,
      prepare: false, // Recommended for Cloudflare Workers
      idle_timeout: 20, // Close idle connections quickly
      max_lifetime: 60 * 30, // 30 minutes max connection lifetime
      transform: {
         undefined: null, // Convert undefined to null for PostgreSQL
      },
      onnotice: () => {}, // Suppress notices in Workers
   });

   return drizzle(client, { schema });
}
