import { redirect } from "@tanstack/react-router";

export function requireLoginRedirect(redirectTo: string, feature: string) {
  throw redirect({
    to: "/login",
    search: {
      redirect: redirectTo,
      reason: `Sign in to use ${feature}.`,
    },
  });
}
