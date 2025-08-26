import { session, user, account, verification } from "./auth";

export const schema = {
   ...user,
   ...session,
   ...account,
   ...verification,
} as const;

export type DbSchema = typeof schema;
export default schema;
