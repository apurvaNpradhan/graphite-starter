import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/index";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Auth } from "./lib/auth";
import { createAuth } from "./lib/auth";
import { createDb } from "./db";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { AppContext } from "./lib/context";
const app = new Hono<AppContext>();
app.use(logger());
app.use("/api/*", async (c, next) => {
   const db = createDb(c.env.HYPERDRIVE);

   // Initialize auth
   const auth = createAuth(db);

   // Get session info
   const session = await auth.api.getSession({ headers: c.req.raw.headers });

   // Set context variables
   c.set("db", db);
   c.set("auth", auth);
   c.set("session", session?.session ?? null);
   c.set("user", session?.user ?? null);

   await next();
});
app.use(
   "/*",
   cors({
      origin: env.CORS_ORIGIN || "",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
   })
);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
   const auth = c.get("auth");
   if (!auth) {
      return c.json({ error: "Authentication service not initialized" }, 503);
   }
   return auth.handler(c.req.raw);
});

app.use("/api/trpc/*", (c) => {
   return fetchRequestHandler({
      req: c.req.raw,
      router: appRouter,
      endpoint: "/api/trpc",
      async createContext({ req, resHeaders, info }) {
         const db = c.get("db");
         const auth = c.get("auth");

         if (!db) {
            throw new Error("Database not available in context");
         }

         if (!auth) {
            throw new Error("Authentication service not available in context");
         }

         const sessionData = await auth.api.getSession({
            headers: req.headers,
         });

         return {
            req,
            res: c.res,
            resHeaders,
            info,
            env: c.env,
            db,
            session: sessionData?.session ?? null,
            user: sessionData?.user ?? null,
            cache: new Map(),
         };
      },
      batching: {
         enabled: true,
      },
      onError({ error, path }) {
         console.error("tRPC error on path", path, ":", error);
      },
   });
});
app.get("/", (c) => {
   return c.text("OK");
});

export default app;
