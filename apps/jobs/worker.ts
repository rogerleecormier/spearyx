// Cloudflare Worker entry point
// This file wraps the TanStack Start server and injects Cloudflare bindings

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    console.log('🔧 Custom worker.ts entry point executing')
    console.log('🔧 env.DB available:', !!env.DB)
    console.log('🔧 env.AI available:', !!env.AI)
    
    // Import the TanStack Start server
    const { default: server } = await import('./dist/server/server.js')
    
    // Create a custom request with env attached
    // We'll attach env to a custom header that we can read in getDbFromContext
    const customRequest = new Request(request, {
      headers: new Headers(request.headers)
    })
    
    // Store env globally so getDbFromContext can access it
    ;(globalThis as any).__CF_ENV__ = env
    ;(globalThis as any).__CF_CTX__ = ctx
    
    console.log('🔧 Set globalThis.__CF_ENV__.DB:', !!(globalThis as any).__CF_ENV__?.DB)
    console.log('🔧 Set globalThis.__CF_ENV__.AI:', !!(globalThis as any).__CF_ENV__?.AI)
    
    // Call the TanStack Start server
    return server.fetch(customRequest, env, ctx)
  },
}
