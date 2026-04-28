import { getDb } from "@/db/db";
import { linkedinSavedSearches } from "@/db/schema";
import type { CloudflareEnv } from "@/lib/cloudflare";
import { getLinkedinSettings, pruneDuplicateLinkedinJobResults, pruneExpiredLinkedinJobResults } from "@/lib/linkedin-persistence";
import { buildLinkedInSearchUrl, buildLinkedInSearchUrlForPage, normalizeLinkedInSearchParams, type LinkedInScrapedJob, type LinkedInSearchParams } from "@/lib/linkedin-search";
import { scoreJobAgainstProfile } from "@/lib/ai/job-score";
import {
  buildLinkedinJobSemanticKey,
  canonicalizeLinkedinJobUrl,
  findExistingLinkedinJobs,
  findSemanticallyMatchingExistingLinkedinJobs,
  upsertLinkedinJobResults,
} from "@/lib/linkedin-persistence";

type BrowserPage = any;

function shouldRunFrequency(lastRunAt: string | null, frequency: "hourly" | "every_6_hours" | "daily") {
  if (!lastRunAt) return true;
  const hoursSince = (Date.now() - new Date(lastRunAt).getTime()) / (1000 * 60 * 60);
  if (frequency === "hourly") return hoursSince >= 1;
  if (frequency === "every_6_hours") return hoursSince >= 6;
  return hoursSince >= 24;
}

async function extractSearchCards(page: BrowserPage, limit: number): Promise<LinkedInScrapedJob[]> {
  return page.evaluate((maxResults: number) => {
    const rows = Array.from(
      document.querySelectorAll("li, .base-card, .jobs-search__results-list li, .jobs-search-results__list-item"),
    );
    const results: LinkedInScrapedJob[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const anchor =
        row.querySelector<HTMLAnchorElement>('a[href*="/jobs/view/"]') ||
        row.querySelector<HTMLAnchorElement>('a.base-card__full-link');
      if (!anchor?.href) continue;

      const url = new URL(anchor.href, window.location.origin);
      const id = url.pathname.match(/\/jobs\/view\/(\d+)/)?.[1] || url.searchParams.get("currentJobId") || anchor.href;
      if (seen.has(id)) continue;
      seen.add(id);

      const title = (
        row.querySelector(".base-search-card__title")?.textContent ||
        row.querySelector(".job-search-card__title")?.textContent ||
        anchor.textContent ||
        ""
      ).replace(/\s+/g, " ").trim();
      if (!title) continue;

      results.push({
        id,
        title,
        company: (
          row.querySelector(".base-search-card__subtitle")?.textContent ||
          row.querySelector(".job-search-card__subtitle")?.textContent ||
          row.querySelector("h4")?.textContent ||
          ""
        ).replace(/\s+/g, " ").trim() || "Unknown company",
        location: (
          row.querySelector(".job-search-card__location")?.textContent ||
          row.querySelector(".base-search-card__metadata")?.textContent ||
          ""
        ).replace(/\s+/g, " ").trim() || "Location not listed",
        sourceUrl: anchor.href,
        sourceName: "LinkedIn",
        postDateText: (
          row.querySelector("time")?.getAttribute("datetime") ||
          row.querySelector("time")?.textContent ||
          ""
        ).replace(/\s+/g, " ").trim() || null,
        workplaceType: null,
        salary: (
          row.querySelector(".job-search-card__salary-info")?.textContent ||
          ""
        ).replace(/\s+/g, " ").trim() || null,
        snippet: (
          row.querySelector(".job-search-card__snippet")?.textContent ||
          row.querySelector(".base-search-card__snippet")?.textContent ||
          ""
        ).replace(/\s+/g, " ").trim() || null,
        description: null,
      });

      if (results.length >= maxResults) break;
    }

    return results;
  }, limit);
}

async function expandSearchResults(page: BrowserPage, targetCount: number) {
  await page.evaluate(async (desiredCount: number) => {
    for (let i = 0; i < 8; i++) {
      const currentCount = document.querySelectorAll('a[href*="/jobs/view/"], a.base-card__full-link').length;
      if (currentCount >= desiredCount) break;
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }, targetCount);
}

function dedupeJobsByCanonicalUrl(jobs: LinkedInScrapedJob[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = canonicalizeLinkedinJobUrl(job.sourceUrl, job.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeJobsBySemanticKey(jobs: LinkedInScrapedJob[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = buildLinkedinJobSemanticKey({
      title: job.title,
      company: job.company,
      location: job.location,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    const text = ((preferred?.textContent || copy.innerText || copy.textContent || "")).replace(/\s+/g, " ").trim();
    return text.length > 120 ? text : null;
  });
}

async function buildProfile(db: ReturnType<typeof getDb>, userId: number) {
  const { masterResume } = await import("@/db/schema");
  const [resume] = await db.select().from(masterResume).where((await import("drizzle-orm")).eq(masterResume.userId, userId)).limit(1);
  if (!resume?.rawText) return null;
  let profile = `Resume:\n${resume.rawText}`;
  try {
    if (resume.competencies) {
      const competencies = JSON.parse(resume.competencies) as string[];
      if (competencies.length > 0) profile += `\n\nCore Competencies: ${competencies.join(", ")}`;
    }
  } catch {}
  try {
    if (resume.tools) {
      const tools = JSON.parse(resume.tools) as string[];
      if (tools.length > 0) profile += `\n\nTools: ${tools.join(", ")}`;
    }
  } catch {}
  return profile;
}

async function collectLinkedinJobsAcrossPages(args: {
  browser: Awaited<ReturnType<typeof import("@cloudflare/puppeteer")["default"]["launch"]>>;
  criteria: LinkedInSearchParams;
}) {
  const allJobs: LinkedInScrapedJob[] = [];
  const requestedPages = args.criteria.pagesToScan || 1;
  const perPageLimit = args.criteria.limit || 10;

  for (let pageOffset = 0; pageOffset < requestedPages; pageOffset += 1) {
    const pageNumber = (args.criteria.page || 1) + pageOffset;
    const searchUrl = buildLinkedInSearchUrlForPage(args.criteria, pageNumber);
    const page = await args.browser.newPage();
    try {
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await expandSearchResults(page, perPageLimit);
      const pageJobs = await extractSearchCards(page, perPageLimit);
      allJobs.push(
        ...pageJobs.map((job) => ({
          ...job,
          sourceUrl: canonicalizeLinkedinJobUrl(job.sourceUrl, job.id),
        })),
      );
    } finally {
      await page.close();
    }
  }

  return dedupeJobsByCanonicalUrl(allJobs);
}

export async function runLinkedinSearchMaintenance(env: CloudflareEnv) {
  const settings = await getLinkedinSettings();
  const duplicatePrunedCount = await pruneDuplicateLinkedinJobResults();
  const prunedCount = await pruneExpiredLinkedinJobResults();

  const db = getDb(env.DB);
  const searches = await db.select().from(linkedinSavedSearches).where((await import("drizzle-orm")).eq(linkedinSavedSearches.isActive, 1));

  const dueSearches = searches.filter((search) => shouldRunFrequency(search.lastRunAt ?? null, settings.linkedinSearchCronFrequency));
  if (dueSearches.length === 0) {
    return { duplicatePrunedCount, prunedCount, executedSearches: 0 };
  }

  const puppeteer = await import("@cloudflare/puppeteer");
  const browser = await puppeteer.default.launch(env.BROWSER);
  const ai = env.AI;

  try {
    for (const search of dueSearches) {
      const criteria = normalizeLinkedInSearchParams(JSON.parse(search.criteria) as LinkedInSearchParams);
      const searchUrl = buildLinkedInSearchUrl(criteria);
      let jobs = await collectLinkedinJobsAcrossPages({ browser, criteria });

      const existingJobsByUrl = await findExistingLinkedinJobs({
        userId: search.userId,
        jobs: jobs.map((job) => ({ id: job.id, sourceUrl: job.sourceUrl })),
      });
      const semanticExistingJobs = await findSemanticallyMatchingExistingLinkedinJobs({
        userId: search.userId,
        jobs,
      });
      jobs = dedupeJobsBySemanticKey(
        jobs.filter((job) => {
          const exactMatch = existingJobsByUrl.get(canonicalizeLinkedinJobUrl(job.sourceUrl, job.id));
          const semanticKey = buildLinkedinJobSemanticKey({
            title: job.title,
            company: job.company,
            location: job.location,
          });
          const semanticMatch = semanticExistingJobs.get(semanticKey);
          return !exactMatch && !semanticMatch;
        }),
      );
      if (jobs.length === 0) {
        await upsertLinkedinJobResults({
          userId: search.userId,
          savedSearchId: search.id,
          searchUrl,
          criteria,
          jobs: [],
        });
        continue;
      }

      for (const job of jobs) {
        const detailPage = await browser.newPage();
        try {
          await detailPage.goto(canonicalizeLinkedinJobUrl(job.sourceUrl, job.id), { waitUntil: "domcontentloaded", timeout: 60000 });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          job.description = await extractJobDescription(detailPage);
        } catch {
          job.description = job.snippet;
        } finally {
          await detailPage.close();
        }
      }

      const profile = await buildProfile(db, search.userId);
      if (!profile) continue;

      const scoredJobs = await Promise.all(
        jobs.map(async (job) => {
          const score = await scoreJobAgainstProfile(ai, profile, {
            id: job.id,
            title: job.title,
            description: job.description || job.snippet || `${job.title} ${job.company} ${job.location}`,
          });
          return {
            ...job,
            score,
          };
        }),
      );

      await upsertLinkedinJobResults({
        userId: search.userId,
        savedSearchId: search.id,
        searchUrl,
        criteria,
        jobs: scoredJobs,
      });
    }
  } finally {
    await browser.close();
  }

  return { duplicatePrunedCount, prunedCount, executedSearches: dueSearches.length };
}
