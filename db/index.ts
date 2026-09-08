import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
// const databaseUrl = process.env.PROD_DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
