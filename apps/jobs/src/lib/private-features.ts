import { redirect } from "@tanstack/react-router";
import type { SessionUser } from "./cloudflare";

const LINKEDIN_SEARCH_OWNER_EMAILS = ["rogerleecormier@gmail.com"];

export function canAccessLinkedInSearch(user?: SessionUser | null): boolean {
  if (!user?.email) return false;
  return LINKEDIN_SEARCH_OWNER_EMAILS.includes(user.email.toLowerCase());
}

export function requireLinkedInSearchOwner(user?: SessionUser | null) {
  if (!canAccessLinkedInSearch(user)) {
    throw redirect({ to: "/jobs" });
  }
}
