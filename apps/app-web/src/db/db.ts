import {
  drizzle,
  DrizzleD1Database as DrizzleD1DatabaseType,
} from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { getD1Database } from "../lib/cloudflare-dev";

export { schema };

export type DrizzleD1Database = DrizzleD1DatabaseType<typeof schema>;

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Helper to get DB from context (for use in API routes)
export async function getDbFromContext(context: any) {
  // Try different possible locations for the DB binding
  const d1Binding = context?.cloudflare?.env?.DB || context?.env?.DB;

  if (d1Binding) {
    return getDb(d1Binding);
  }

    // In development, use local SQLite
  if (import.meta.env.DEV) {
    console.log('⚠️  D1 binding not found in context, using local SQLite for development')
    const dbPath = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/06a500e275bd2a50241cdcf76c189feed6a340311d3f01e9b730f2df0a30bb26.sqlite'
    const sqlite = new Database(dbPath)
    return drizzleSqlite(sqlite, { schema })
  }

  // In production, we must have D1
  console.error("DB binding not found. Context structure:", {
    hasContext: !!context,
    hasCloudflare: !!context?.cloudflare,
    hasCloudflareEnv: !!context?.cloudflare?.env,
    hasEnv: !!context?.env,
    cloudflareEnvKeys: context?.cloudflare?.env
      ? Object.keys(context.cloudflare.env)
      : [],
    envKeys: context?.env ? Object.keys(context.env) : [],
  });
  throw new Error(
    "DB binding not found. Make sure you are running the dev server with wrangler support."
  );
}
