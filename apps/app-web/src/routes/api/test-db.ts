import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../db/db'

export const Route = createFileRoute('/api/test-db')({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any
        
        try {
          console.log('🔍 Test DB endpoint called')
          console.log('🔍 Context:', JSON.stringify({
            hasContext: !!ctx,
            hasCloudflare: !!ctx?.cloudflare,
            hasCloudflareEnv: !!ctx?.cloudflare?.env,
            hasEnv: !!ctx?.env,
            cloudflareEnvKeys: ctx?.cloudflare?.env ? Object.keys(ctx.cloudflare.env) : [],
            envKeys: ctx?.env ? Object.keys(ctx.env) : [],
          }, null, 2))
          
          const db = await getDbFromContext(ctx)
          console.log('✅ DB connection successful')
          
          // Try a simple query
          const result = await db.select().from(schema.jobs).limit(1)
          
          return json({
            success: true,
            message: 'DB connection successful',
            jobCount: result.length,
          })
        } catch (error) {
          console.error('❌ Test DB failed:', error)
          return json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          }, { status: 500 })
        }
      }
    }
  }
})
