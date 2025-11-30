import { getPlatformProxy } from 'wrangler'

let platformProxy: Awaited<ReturnType<typeof getPlatformProxy>> | null = null

export async function getCloudflareContext() {
  if (!platformProxy) {
    platformProxy = await getPlatformProxy({
      configPath: './wrangler.toml',
      persist: { path: '.wrangler/state/v3' }
    })
  }
  return platformProxy
}

export async function getD1Database() {
  const proxy = await getCloudflareContext()
  return (proxy.env as any).DB as D1Database
}
