'use server';
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, and } from "drizzle-orm";
import { getCloudflareEnv } from "@/lib/cloudflare";
import type { CloudflareEnv } from "@/lib/cloudflare";
import { getDb } from "@/db/db";
import { jobAnalyses, generatedDocuments } from "@/db/schema";
import { resolveSessionUser } from "@/lib/resolve-user";
import { aggregateAnalytics } from "@/server/cron/aggregate-analytics";

export interface HistoryRow {
  id: number;
  createdAt: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  jobUrl: string;
  pursue: boolean;
  applied: boolean;
  appliedAt: string | null;
  documents: Array<{ id: number; docType: string; r2Key: string; fileName: string }>;
}

export const getHistory = createServerFn({ method: "GET" })
  .inputValidator((data: { page?: number; pageSize?: number }) => data)
  .handler(async ({ data }): Promise<{ rows: HistoryRow[]; total: number }> => {
    try {
      const env = getCloudflareEnv();
      if (!env.DB) return { rows: [], total: 0 };

      const user = await resolveSessionUser();
      if (!user) return { rows: [], total: 0 };

      const page = data.page ?? 1;
      const pageSize = data.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      const db = getDb(env.DB);

      const analyses = await db
        .select()
        .from(jobAnalyses)
        .where(eq(jobAnalyses.userId, user.id))
        .orderBy(desc(jobAnalyses.createdAt))
        .limit(pageSize)
        .offset(offset);

      const countResult = await db
        .select({ id: jobAnalyses.id })
        .from(jobAnalyses)
        .where(eq(jobAnalyses.userId, user.id));

      const rows: HistoryRow[] = await Promise.all(
        analyses.map(async (a) => {
          const docs = await db
            .select()
            .from(generatedDocuments)
            .where(eq(generatedDocuments.jobAnalysisId, a.id))
            .orderBy(desc(generatedDocuments.id));

          return {
            id: a.id,
            createdAt: a.createdAt ?? "",
            jobTitle: a.jobTitle ?? "Untitled",
            company: a.company ?? "Unknown",
            matchScore: a.matchScore ?? 0,
            jobUrl: a.jobUrl,
            pursue: a.pursue === 1,
            applied: a.applied === 1,
            appliedAt: a.appliedAt ?? null,
            documents: docs.map((d) => ({
              id: d.id,
              docType: d.docType,
              r2Key: d.r2Key,
              fileName: d.fileName ?? "",
            })),
          };
        }),
      );

      return { rows, total: countResult.length };
    } catch (error) {
      console.error("[getHistory] error:", error);
      return { rows: [], total: 0 };
    }
  });

export const getDocumentDownload = createServerFn({ method: "GET" })
  .inputValidator((data: { r2Key: string }) => data)
  .handler(async ({ data }) => {
    const env = getCloudflareEnv();
    if (!env.R2) throw new Error("R2 storage not available");

    const object = await env.R2.get(data.r2Key);
    if (!object) throw new Error("Document not found");

    const bytes = await object.arrayBuffer();
    return {
      data: Array.from(new Uint8Array(bytes)),
      contentType: object.httpMetadata?.contentType ?? "application/pdf",
      fileName: object.customMetadata?.fileName ?? data.r2Key.split("/").pop() ?? "document.pdf",
    };
  });

export const getDocumentsForAnalysis = createServerFn({ method: "GET" })
  .inputValidator((data: { analysisId: number }) => data)
  .handler(async ({ data }) => {
    const env = getCloudflareEnv();
    if (!env.DB) return { resume: null, coverLetter: null };

    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");

    const db = getDb(env.DB);
    const docs = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.jobAnalysisId, data.analysisId));

    const resume = docs.find((d) => d.docType === "resume");
    const coverLetter = docs.find((d) => d.docType === "cover_letter");

    return {
      resume: resume ? { documentId: resume.id, fileName: resume.fileName, r2Key: resume.r2Key } : null,
      coverLetter: coverLetter ? { documentId: coverLetter.id, fileName: coverLetter.fileName, r2Key: coverLetter.r2Key } : null,
    };
  });

export const deleteHistoryItem = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const env = getCloudflareEnv();
    if (!env.DB) throw new Error("Database not available");

    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");

    const db = getDb(env.DB);
    const [analysis] = await db
      .select()
      .from(jobAnalyses)
      .where(and(eq(jobAnalyses.id, data.id), eq(jobAnalyses.userId, user.id)))
      .limit(1);

    if (!analysis) throw new Error("Analysis not found or not authorized");

    const docs = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.jobAnalysisId, analysis.id));

    if (env.R2) {
      await Promise.all(
        docs.map(async (doc) => {
          try { await env.R2!.delete(doc.r2Key); } catch (e) {
            console.error("[deleteHistoryItem] R2 delete error:", e);
          }
        }),
      );
    }

    await db.delete(generatedDocuments).where(eq(generatedDocuments.jobAnalysisId, analysis.id));
    await db.delete(jobAnalyses).where(and(eq(jobAnalyses.id, analysis.id), eq(jobAnalyses.userId, user.id)));

    aggregateAnalytics(env as CloudflareEnv, user.id).catch((e) =>
      console.error("[deleteHistoryItem] aggregateAnalytics error:", e),
    );

    return { ok: true, id: analysis.id };
  });
