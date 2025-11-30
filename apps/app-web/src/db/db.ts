import {
  drizzle,
  DrizzleD1Database as DrizzleD1DatabaseType,
} from "drizzle-orm/d1";
// import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
// import Database from "better-sqlite3";
import * as schema from "./schema";
import { getD1Database } from "../lib/cloudflare-dev";

export { schema };

export type DrizzleD1Database = DrizzleD1DatabaseType<typeof schema>;

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Helper to get DB from context (for use in API routes)
export async function getDbFromContext(context: any) {
  // In production (Cloudflare Workers), check the context for DB binding
  // The context structure in TanStack Start with Cloudflare can vary:
  // - context.cloudflare.env.DB (TanStack Start format)
  // - context.env.DB (direct Cloudflare Worker format)
  // - context.DB (direct binding)
  
  let d1Binding: D1Database | undefined;
  
  // Try all possible context locations
  if (context?.cloudflare?.env?.DB) {
    d1Binding = context.cloudflare.env.DB;
  } else if (context?.env?.DB) {
    d1Binding = context.env.DB;
  } else if (context?.DB) {
    d1Binding = context.DB;
  }

  if (d1Binding) {
    return getDb(d1Binding);
  }

  // In development, use local SQLite
  if (import.meta.env.DEV) {
    console.log(
      "⚠️  D1 binding not found in context, using local SQLite for development"
    );
    try {
      const { drizzle: drizzleSqlite } = await import(
        "drizzle-orm/better-sqlite3"
      );
      const { default: Database } = await import("better-sqlite3");

      const dbPath =
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/06a500e275bd2a50241cdcf76c189feed6a340311d3f01e9b730f2df0a30bb26.sqlite";
      const sqlite = new Database(dbPath);
      return drizzleSqlite(sqlite, { schema });
    } catch (error) {
      console.error("Failed to initialize local SQLite:", error);
      throw new Error(
        `Development database initialization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // In production, we must have D1 - log detailed error
  const debugInfo = {
    hasContext: !!context,
    contextType: typeof context,
    hasCloudflare: !!context?.cloudflare,
    hasCloudflareEnv: !!context?.cloudflare?.env,
    hasEnv: !!context?.env,
    hasDB: !!context?.DB,
    cloudflareEnvKeys: context?.cloudflare?.env
      ? Object.keys(context.cloudflare.env)
      : [],
    envKeys: context?.env ? Object.keys(context.env) : [],
    contextKeys: context ? Object.keys(context) : [],
  };
  
  console.error("❌ DB binding not found in production. Context structure:", debugInfo);
  
  throw new Error(
    `DB binding not found in production environment. Please ensure the D1 database is properly configured in wrangler.toml and bound to your Worker. Context structure: ${JSON.stringify(debugInfo)}`
  );
}
