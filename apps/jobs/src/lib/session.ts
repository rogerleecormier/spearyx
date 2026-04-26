import { nanoid } from "nanoid";
import type { CloudflareEnv } from "./cloudflare";

export const SESSION_COOKIE = "spearyx-session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export async function createSession(
  userId: number,
  env: Partial<CloudflareEnv>,
): Promise<string> {
  if (!env.KV) throw new Error("KV binding unavailable");
  const token = nanoid(32);
  const session = { userId, createdAt: new Date().toISOString() };
  await env.KV.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: SESSION_TTL,
  });
  return token;
}

export async function getSession(
  token: string,
  env: Partial<CloudflareEnv>,
): Promise<{ userId: number; createdAt: string } | null> {
  if (!env.KV || !token) return null;
  const raw = await env.KV.get(`session:${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteSession(
  token: string,
  env: Partial<CloudflareEnv>,
): Promise<void> {
  if (!env.KV || !token) return;
  await env.KV.delete(`session:${token}`);
}

export function extractSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/spearyx-session=([^;]+)/);
  return match ? match[1] : null;
}
