import {
  drizzle,
  DrizzleD1Database as DrizzleD1DatabaseType,
} from "drizzle-orm/d1";
// import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
// import Database from "better-sqlite3";
import * as schema from "./schema";

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

  // In development with Cloudflare Vite plugin, D1 should be available
  if (import.meta.env.DEV) {
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

    console.error(
      "❌ D1 binding not found in development. Please ensure:\n" +
        "1. Cloudflare Vite plugin is configured in vite.config.ts\n" +
        "2. wrangler.toml has D1 database configured\n" +
        "3. Development server was started with 'npm run dev'\n" +
        "Context structure:",
      debugInfo
    );

    throw new Error(
      `D1 binding not found in development. Make sure Cloudflare Vite plugin is configured. Context: ${JSON.stringify(debugInfo)}`
    );
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

  console.error(
    "❌ DB binding not found in production. Context structure:",
    debugInfo
  );

  throw new Error(
    `DB binding not found in production environment. Please ensure the D1 database is properly configured in wrangler.toml and bound to your Worker. Context structure: ${JSON.stringify(debugInfo)}`
  );
}
