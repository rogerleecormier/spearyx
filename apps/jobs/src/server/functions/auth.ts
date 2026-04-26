'use server';
import { createServerFn } from "@tanstack/react-start";
import { setCookie, getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getCloudflareEnv } from "@/lib/cloudflare";
import type { SessionUser } from "@/lib/cloudflare";
import {
  SESSION_COOKIE,
  createSession,
  deleteSession,
  extractSessionToken,
} from "@/lib/session";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Validate credentials, create a KV session, and set HttpOnly cookie.
 */
export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }): Promise<{ user: SessionUser }> => {
    const env = getCloudflareEnv();
    if (!env.DB || !env.KV) throw new Error("Service unavailable");

    const db = getDb(env.DB);
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!dbUser) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(data.password, dbUser.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = await createSession(dbUser.id, env);

    setCookie(SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: SESSION_TTL,
    });

    return {
      user: { id: dbUser.id, email: dbUser.email, role: dbUser.role },
    };
  });

/**
 * Delete the KV session and clear the session cookie.
 */
export const logoutUser = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const env = getCloudflareEnv();
    const request = getRequest();
    const token = extractSessionToken(request);
    if (token && env.KV) await deleteSession(token, env);

    setCookie(SESSION_COOKIE, "", {
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 0,
    });

    return { success: true };
  },
);

/**
 * Read the current user from the session cookie.
 * Used in root route beforeLoad to hydrate router context.
 * Returns null when unauthenticated — never throws.
 */
export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const env = getCloudflareEnv();
      if (!env.DB || !env.KV) return null;

      const request = getRequest();
      const token = extractSessionToken(request);
      if (!token) return null;

      const raw = await env.KV.get(`session:${token}`);
      if (!raw) return null;

      const { userId } = JSON.parse(raw) as { userId: number };
      const db = getDb(env.DB);
      const [dbUser] = await db
        .select({ id: users.id, email: users.email, role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!dbUser) return null;
      return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    } catch (error) {
      console.error("[getCurrentUser] error:", error);
      return null;
    }
  },
);
