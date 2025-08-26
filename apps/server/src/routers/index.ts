import { user } from "@/db/schema/auth";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import type { DrizzleError } from "drizzle-orm";

export const appRouter = router({
   healthCheck: publicProcedure.query(() => {
      return "OK";
   }),
   listUsers: publicProcedure.query(async ({ ctx }) => {
      try {
         const data = await ctx.db.select().from(user);
         if (data) {
            return {
               users: data,
            };
         }
         return {
            users: null,
         };
      } catch (err) {
         const error = err as DrizzleError;
         throw new TRPCError({
            message: error.message,
            code: "INTERNAL_SERVER_ERROR",
         });
      }
   }),

   privateData: protectedProcedure.query(({ ctx }) => {
      return {
         message: "This is private",
         user: ctx.user,
      };
   }),
});
export type AppRouter = typeof appRouter;
