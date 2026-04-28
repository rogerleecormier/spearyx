import { env as cfEnv } from "cloudflare:workers";

export interface SessionUser {
  id: number;
  email: string;
  role: string;
}

export interface CloudflareEnv {
  DB: D1Database;
  KV: KVNamespace;
}

export function getCloudflareEnv(): Partial<CloudflareEnv> {
  return cfEnv as unknown as Partial<CloudflareEnv>;
}
