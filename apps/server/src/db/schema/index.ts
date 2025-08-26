import { user } from "./auth";

export const schema = {
   ...user,
} as const;

export type DbSchema = typeof schema;
export default schema;
