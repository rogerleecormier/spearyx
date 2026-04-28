'use server';
import { createServerFn } from "@tanstack/react-start";
import { resolveSessionUser } from "@/lib/resolve-user";
import type { LinkedInSearchParams } from "@/lib/linkedin-search";
import {
  deleteLinkedinSavedSearch,
  listLinkedinHistory,
  listSavedLinkedinSearches,
  saveLinkedinSearchDefinition,
  setLinkedinSavedSearchActive,
} from "@/lib/linkedin-persistence";

export const getSavedLinkedinSearches = createServerFn({ method: "GET" }).handler(async () => {
  const user = await resolveSessionUser();
  if (!user) throw new Error("Not authenticated");
  return listSavedLinkedinSearches(user.id);
});

export const saveLinkedinSearch = createServerFn({ method: "POST" })
  .inputValidator((data: { id?: number; name: string; criteria: LinkedInSearchParams; isActive?: boolean }) => data)
  .handler(async ({ data }) => {
    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");
    if (!data.name.trim()) throw new Error("Search name is required");
    const id = await saveLinkedinSearchDefinition({
      userId: user.id,
      id: data.id,
      name: data.name,
      criteria: data.criteria,
      isActive: data.isActive,
    });
    return { success: true, id };
  });

export const removeLinkedinSearch = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");
    await deleteLinkedinSavedSearch(data.id, user.id);
    return { success: true };
  });

export const toggleLinkedinSearchCron = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; isActive: boolean }) => data)
  .handler(async ({ data }) => {
    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");
    await setLinkedinSavedSearchActive(data.id, user.id, data.isActive);
    return { success: true };
  });

export const getLinkedinJobHistory = createServerFn({ method: "GET" })
  .inputValidator((data: { page?: number; pageSize?: number }) => data)
  .handler(async ({ data }) => {
    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");
    return listLinkedinHistory({
      user,
      page: data.page ?? 1,
      pageSize: data.pageSize ?? 20,
    });
  });
