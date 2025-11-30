let platformProxy: any | null = null;

export async function getCloudflareContext() {
  if (!platformProxy) {
    if (import.meta.env?.DEV || process.env.NODE_ENV === "development") {
      const { getPlatformProxy } = await import("wrangler");
      platformProxy = await getPlatformProxy({
        configPath: "./wrangler.toml",
        persist: { path: ".wrangler/state/v3" },
      });
    } else {
      // In production (Cloudflare Worker) there is no local platform proxy to use.
      // Return null or throw depending on intended usage; callers should use D1 binding directly instead.
      throw new Error(
        "getCloudflareContext is only available in dev environment"
      );
    }
  }
  return platformProxy;
}

export async function getD1Database() {
  const proxy = await getCloudflareContext();
  return (proxy.env as any).DB as D1Database;
}
