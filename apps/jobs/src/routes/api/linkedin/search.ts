import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "../../../db/db";
import { getAIFromContext } from "../../../lib/ai";
import { scoreJobAgainstProfile } from "../../../lib/ai/job-score";
import { getCloudflareEnv } from "../../../lib/cloudflare";
import { resolveSessionUser } from "../../../lib/resolve-user";
import {
  buildLinkedInSearchUrl,
  normalizeLinkedInSearchParams,
  type LinkedInScrapedJob,
  type LinkedInSearchParams,
} from "../../../lib/linkedin-search";
import { canAccessLinkedInSearch } from "../../../lib/private-features";

type BrowserPage = Awaited<ReturnType<typeof import("@cloudflare/puppeteer")["default"]["launch"]>> extends {
  newPage: () => Promise<infer T>;
}
  ? T
  : any;

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getCachedJson<T>(kv: KVNamespace | undefined, key: string): Promise<T | null> {
  if (!kv) return null;
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function putCachedJson(kv: KVNamespace | undefined, key: string, value: unknown, ttl = 3600) {
  if (!kv) return;
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
}

function safeParseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch (error) {
    console.error("[linkedin-search] failed to parse stored resume JSON:", error);
    return [];
  }
}

function dedupeJobs(jobs: LinkedInScrapedJob[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });
}

async function extractSearchCards(page: BrowserPage, limit: number): Promise<LinkedInScrapedJob[]> {
  const jobs = await page.evaluate((maxResults: number) => {
    const rows = Array.from(
      document.querySelectorAll("li, .base-card, .jobs-search__results-list li, .jobs-search-results__list-item"),
    );

    const results: LinkedInScrapedJob[] = [];

    for (const row of rows) {
      const anchor =
        row.querySelector<HTMLAnchorElement>('a[href*="/jobs/view/"]') ||
        row.querySelector<HTMLAnchorElement>('a.base-card__full-link');
      if (!anchor?.href) continue;

      const url = new URL(anchor.href, window.location.origin);
      const idMatch = url.pathname.match(/\/jobs\/view\/(\d+)/);
      const id = idMatch?.[1] || url.searchParams.get("currentJobId") || url.href;
      const title = (
        row.querySelector(".base-search-card__title")?.textContent ||
        row.querySelector(".job-search-card__title")?.textContent ||
        anchor.textContent ||
        ""
      ).replace(/\s+/g, " ").trim();
      if (!title) continue;

      const company = (
        row.querySelector(".base-search-card__subtitle")?.textContent ||
        row.querySelector(".job-search-card__subtitle")?.textContent ||
        row.querySelector("h4")?.textContent ||
        ""
      ).replace(/\s+/g, " ").trim();
      const location = (
        row.querySelector(".job-search-card__location")?.textContent ||
        row.querySelector(".base-search-card__metadata")?.textContent ||
        ""
      ).replace(/\s+/g, " ").trim();
      const postDateRaw =
        row.querySelector("time")?.getAttribute("datetime") ||
        row.querySelector("time")?.textContent ||
        "";
      const postDateText = postDateRaw.replace(/\s+/g, " ").trim() || null;

      const salaryNodeText =
        row.querySelector(".job-search-card__salary-info")?.textContent ||
        "";
      const metadataText =
        row.querySelector(".base-search-card__metadata")?.textContent ||
        "";
      const metadataSalaryMatch = metadataText.match(/\$[\s\S]*/);
      const salary =
        salaryNodeText.replace(/\s+/g, " ").trim() ||
        (metadataSalaryMatch?.[0] || "").replace(/\s+/g, " ").trim() ||
        null;

      const snippet = (
        row.querySelector(".job-search-card__snippet")?.textContent ||
        row.querySelector(".base-search-card__snippet")?.textContent ||
        ""
      ).replace(/\s+/g, " ").trim() || null;

      results.push({
        id,
        title,
        company: company || "Unknown company",
        location: location || "Location not listed",
        sourceUrl: `https://www.linkedin.com/jobs/view/${id}/`,
        sourceName: "LinkedIn",
        postDateText,
        workplaceType: null,
        salary,
        snippet,
        description: null,
      });

      if (results.length >= maxResults) break;
    }

    return results;
  }, limit);

  return dedupeJobs(jobs);
}

async function extractJobDescription(page: BrowserPage): Promise<string | null> {
  return page.evaluate(() => {
    const copy = document.body.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("script, style, nav, footer, header, form").forEach((el) => el.remove());

    const preferred =
      copy.querySelector(".show-more-less-html__markup") ||
      copy.querySelector(".description__text") ||
      copy.querySelector(".jobs-description") ||
      copy.querySelector("main");

    const preferredText = preferred?.textContent || "";
    const fallbackText = copy.innerText || copy.textContent || "";
    const text = (preferredText || fallbackText).replace(/\s+/g, " ").trim();
    return text.length > 120 ? text : null;
  });
}

async function enrichJobDescriptions(
  browser: Awaited<ReturnType<typeof import("@cloudflare/puppeteer")["default"]["launch"]>>,
  kv: KVNamespace | undefined,
  jobs: LinkedInScrapedJob[],
) {
  for (const job of jobs) {
    const key = `linkedin:job:${await sha256(job.sourceUrl)}`;
    const cached = await getCachedJson<{ description: string | null }>(kv, key);
    if (cached?.description) {
      job.description = cached.description;
      continue;
    }

    const page = await browser.newPage();
    try {
      await page.goto(job.sourceUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const description = await extractJobDescription(page);
      job.description = description;
      await putCachedJson(kv, key, { description }, 24 * 60 * 60);
    } catch (error) {
      console.error("[linkedin-search] detail scrape failed:", job.sourceUrl, error);
      job.description = job.snippet;
    } finally {
      await page.close();
    }
  }
}

async function getResumeProfile(userId: number): Promise<string | null> {
  const env = getCloudflareEnv();
  if (!env.DB) return null;
  const db = getDb(env.DB);
  const [resume] = await db
    .select({
      rawText: schema.masterResume.rawText,
      competencies: schema.masterResume.competencies,
      tools: schema.masterResume.tools,
      summary: schema.masterResume.summary,
    })
    .from(schema.masterResume)
    .where(and(eq(schema.masterResume.userId, userId)))
    .limit(1);

  if (!resume) return null;

  const chunks: string[] = [];
  if (resume.rawText) chunks.push(`Resume:\n${resume.rawText}`);
  if (resume.summary) chunks.push(`Summary:\n${resume.summary}`);

  const competencies = safeParseStringArray(resume.competencies);
  const tools = safeParseStringArray(resume.tools);

  if (competencies.length > 0) chunks.push(`Core Competencies: ${competencies.join(", ")}`);
  if (tools.length > 0) chunks.push(`Tools: ${tools.join(", ")}`);

  return chunks.length > 0 ? chunks.join("\n\n") : null;
}

export const Route = createFileRoute("/api/linkedin/search")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        let stage = "initializing";
        try {
          const user = await resolveSessionUser();
          if (!user?.id) {
            return json({ success: false, error: "Authentication required" }, { status: 401 });
          }
          if (!canAccessLinkedInSearch(user)) {
            return json({ success: false, error: "Not found" }, { status: 404 });
          }

          stage = "loading-environment";
          const fallbackEnv = getCloudflareEnv();
          const env = (context as any)?.cloudflare?.env || (context as any)?.env || (globalThis as any).__CF_ENV__ || fallbackEnv || {};
          if (!env.BROWSER) {
            return json(
              {
                success: false,
                error: "Cloudflare Browser Rendering is not available in this environment.",
              },
              { status: 503 },
            );
          }

          stage = "reading-request";
          const body = (await request.json()) as Partial<LinkedInSearchParams>;
          const params = normalizeLinkedInSearchParams(body);

          if (!params.keywords) {
            return json({ success: false, error: "Keywords are required." }, { status: 400 });
          }

          stage = "loading-resume";
          const profile = await getResumeProfile(user.id);
          if (!profile) {
            return json(
              {
                success: false,
                error: "Upload a master resume on your profile before using LinkedIn AI scoring.",
              },
              { status: 400 },
            );
          }

          stage = "loading-ai";
          const ai = await getAIFromContext(context);
          if (!ai) {
            return json({ success: false, error: "AI service is unavailable." }, { status: 503 });
          }

          stage = "building-search-url";
          const searchUrl = buildLinkedInSearchUrl(params);
          const searchCacheKey = `linkedin:search:${await sha256(searchUrl)}:${params.limit}`;
          const cached = await getCachedJson<LinkedInScrapedJob[]>(env.KV, searchCacheKey);

          let jobs = cached;
          if (!jobs) {
            stage = "launching-browser";
            const puppeteer = await import("@cloudflare/puppeteer");
            const browser = await puppeteer.default.launch(env.BROWSER);

            try {
              stage = "loading-linkedin-search-page";
              const page = await browser.newPage();
              await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
              await new Promise((resolve) => setTimeout(resolve, 2500));

              stage = "extracting-search-cards";
              jobs = await extractSearchCards(page, params.limit || 10);
              await page.close();

              if (!jobs || jobs.length === 0) {
                return json({
                  success: true,
                  data: {
                    searchUrl,
                    jobs: [],
                    total: 0,
                    warnings: [
                      "LinkedIn returned no parsable jobs for this query. Try fewer filters or run it on deployed Cloudflare infrastructure.",
                    ],
                  },
                });
              }

              stage = "enriching-job-descriptions";
              await enrichJobDescriptions(browser, env.KV, jobs);
              await putCachedJson(env.KV, searchCacheKey, jobs, 30 * 60);
            } finally {
              await browser.close();
            }
          }

          stage = "scoring-jobs";
          const scoredJobs = await Promise.all(
            jobs.map(async (job) => {
              const score = await scoreJobAgainstProfile(ai, profile, {
                id: job.id,
                title: job.title,
                description: job.description || job.snippet || `${job.title} ${job.company} ${job.location}`,
              });
              return { ...job, score };
            }),
          );

          scoredJobs.sort((a, b) => (b.score?.masterScore || 0) - (a.score?.masterScore || 0));

          return json({
            success: true,
            data: {
              searchUrl,
              jobs: scoredJobs,
              total: scoredJobs.length,
              warnings: scoredJobs.some((job) => !job.description)
                ? ["Some jobs were scored from snippets because LinkedIn did not expose a full description."]
                : [],
            },
          });
        } catch (error) {
          console.error(`[linkedin-search] error during ${stage}:`, error);
          return json(
            {
              success: false,
              error:
                error instanceof Error
                  ? `LinkedIn search failed during ${stage}: ${error.message}`
                  : `LinkedIn search failed during ${stage}.`,
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
