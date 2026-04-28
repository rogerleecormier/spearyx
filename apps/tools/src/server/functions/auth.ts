'use server';
import { createServerFn } from "@tanstack/react-start";
import { setCookie, getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { getCloudflareEnv } from "@/lib/cloudflare";
import type { SessionUser } from "@/lib/cloudflare";
import {
  SESSION_COOKIE,
  SESSION_TTL,
  deleteSession,
  extractSessionToken,
  getSessionCookieDomain,
  shouldUseSecureSessionCookie,
} from "@spearyx/shared-utils";

const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
});

const schema = { users };

function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export const logoutUser = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const env = getCloudflareEnv();
    const request = getRequest();
    const token = extractSessionToken(request);
    if (token) await deleteSession(token, env.KV);

    setCookie(SESSION_COOKIE, "", {
      path: "/",
      httpOnly: true,
      secure: shouldUseSecureSessionCookie(request),
      maxAge: 0,
      sameSite: "lax" as const,
      domain: getSessionCookieDomain(request),
    });

    return { success: true };
  },
);

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    try {
      const env = getCloudflareEnv();
      if (!env.DB || !env.KV) return null;

      const request = getRequest();
      const token = extractSessionToken(request);
      if (!token) return null;

      const raw = await env.KV.get(`session:${token}`);
      if (!raw) {
        const secure = shouldUseSecureSessionCookie(request);
        setCookie(SESSION_COOKIE, "", { path: "/", httpOnly: true, secure, maxAge: 0, sameSite: "lax" as const, domain: ".spearyx.com" });
        setCookie(SESSION_COOKIE, "", { path: "/", httpOnly: true, secure, maxAge: 0, sameSite: "lax" as const, domain: "tools.spearyx.com" });
        setCookie(SESSION_COOKIE, "", { path: "/", httpOnly: true, secure, maxAge: 0, sameSite: "lax" as const });
        return null;
      }

      const { userId } = JSON.parse(raw) as { userId: number };
      const db = getDb(env.DB);
      const [dbUser] = await db
        .select({ id: users.id, email: users.email, role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!dbUser) return null;
      return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    } catch {
      return null;
    }
  },
);
