import {
  drizzle,
  DrizzleD1Database as DrizzleD1DatabaseType,
} from "drizzle-orm/d1";
import * as schema from "./schema";
import type { AppLoadContext } from "../../app/ssr";

export { schema };

export type DrizzleD1Database = DrizzleD1DatabaseType<typeof schema>;

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Helper to get DB from context (for use in API routes)
export async function getDbFromContext(context: AppLoadContext) {
  const d1Binding = context?.cloudflare?.env?.DB;

  if (!d1Binding) {
    throw new Error(
      `DB binding not found. Make sure wrangler.toml has [[d1_databases]] with binding = "DB". Context: ${JSON.stringify(
        {
          hasContext: !!context,
          hasCloudflare: !!context?.cloudflare,
          hasCloudflareEnv: !!context?.cloudflare?.env,
          hasDB: !!context?.cloudflare?.env?.DB,
        }
      )}`
    );
  }

  return getDb(d1Binding);
}
