import { env as cfEnv } from "cloudflare:workers";

export interface SessionUser {
  id: number;
  email: string;
  role: string;
}

export interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  AI: Ai;
  BROWSER: Fetcher;
}

/**
 * Access Cloudflare bindings from a TanStack Start server function.
 * In production returns real bindings from the Workers runtime.
 * In dev the vite.config.ts alias points this import to the stub returning {}.
 */
export function getCloudflareEnv(): Partial<CloudflareEnv> {
  return cfEnv as unknown as Partial<CloudflareEnv>;
}
