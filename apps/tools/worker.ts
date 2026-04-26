import type { CloudflareEnv } from './src/lib/cloudflare'

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    ;(globalThis as any).__CF_ENV__ = env
    ;(globalThis as any).__CF_CTX__ = ctx

    const { default: server } = await import('./dist/server/server.js')
    return server.fetch(request, env, ctx)
  },
}
