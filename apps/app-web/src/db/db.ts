import { drizzle, DrizzleD1Database as DrizzleD1DatabaseType } from 'drizzle-orm/d1'
import * as schema from './schema'

export { schema }

export type DrizzleD1Database = DrizzleD1DatabaseType<typeof schema>

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

// Helper to get DB from context (for use in API routes)
export function getDbFromContext(context: any) {
  // Try different possible locations for the DB binding
  const d1Binding = context?.cloudflare?.env?.DB || context?.env?.DB
  
  if (!d1Binding) {
    console.error('DB binding not found. Context structure:', {
      hasContext: !!context,
      hasCloudflare: !!context?.cloudflare,
      hasCloudflareEnv: !!context?.cloudflare?.env,
      hasEnv: !!context?.env,
      cloudflareEnvKeys: context?.cloudflare?.env ? Object.keys(context.cloudflare.env) : [],
      envKeys: context?.env ? Object.keys(context.env) : [],
    })
    throw new Error('DB binding not found. Make sure you are running the dev server with wrangler support.')
  }
  
  return getDb(d1Binding)
}



