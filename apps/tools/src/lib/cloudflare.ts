import { env as cfEnv } from "cloudflare:workers";

export interface CloudflareEnv {
  AI: Ai;
}

export function getCloudflareEnv(): Partial<CloudflareEnv> {
  return cfEnv as unknown as Partial<CloudflareEnv>;
}
