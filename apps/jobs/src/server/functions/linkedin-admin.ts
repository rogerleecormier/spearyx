'use server';
import { createServerFn } from "@tanstack/react-start";
import {
  getLinkedinSettings,
  saveLinkedinSettings,
  type LinkedinAppSettings,
} from "@/lib/linkedin-persistence";
import { resolveSessionUser } from "@/lib/resolve-user";

async function requireAdmin() {
  const user = await resolveSessionUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");
  return user;
}

export const getLinkedinAdminSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return getLinkedinSettings();
});

export const updateLinkedinAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((data: Partial<LinkedinAppSettings>) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    return saveLinkedinSettings(data);
  });
