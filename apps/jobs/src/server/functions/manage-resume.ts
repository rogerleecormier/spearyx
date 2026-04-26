'use server';
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { resolveSessionUser } from "@/lib/resolve-user";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getDb } from "@/db/db";
import { masterResume } from "@/db/schema";
import { callWorkersAI } from "@/lib/ai-gateway";
import { jsonrepair } from "jsonrepair";

export interface ExperienceEntry {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  graduationDate?: string;
  fieldOfStudy?: string;
}

export interface ResumeData {
  id?: number;
  fullName: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  competencies?: string[];
  tools?: string[];
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  certifications?: string[];
  rawText?: string;
  updatedAt?: string;
}

export const getResume = createServerFn({ method: "GET" }).handler(
  async (): Promise<ResumeData | null> => {
    try {
      const env = getCloudflareEnv();
      if (!env.DB) return null;
      const user = await resolveSessionUser();
      if (!user) return null;

      const db = getDb(env.DB);
      const [row] = await db.select().from(masterResume).where(eq(masterResume.userId, user.id)).limit(1);
      if (!row) return null;

      return {
        id: row.id,
        fullName: row.fullName,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        linkedin: row.linkedin ?? undefined,
        website: row.website ?? undefined,
        summary: row.summary ?? undefined,
        competencies: row.competencies ? JSON.parse(row.competencies) : [],
        tools: row.tools ? JSON.parse(row.tools) : [],
        experience: row.experience ? JSON.parse(row.experience) : [],
        education: row.education ? JSON.parse(row.education) : [],
        certifications: row.certifications ? JSON.parse(row.certifications) : [],
        rawText: row.rawText ?? undefined,
        updatedAt: row.updatedAt ?? undefined,
      };
    } catch (err) {
      console.error("[getResume] error:", err);
      return null;
    }
  },
);

export const saveResume = createServerFn({ method: "POST" })
  .inputValidator((data: ResumeData) => data)
  .handler(async ({ data }): Promise<{ success: boolean; updatedAt: string }> => {
    const env = getCloudflareEnv();
    if (!env.DB) throw new Error("Database not available");

    const user = await resolveSessionUser();
    if (!user) throw new Error("Not authenticated");

    const db = getDb(env.DB);
    const now = new Date().toISOString();

    const baseValues = {
      userId: user.id,
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      linkedin: data.linkedin ?? null,
      website: data.website ?? null,
      rawText: data.rawText ?? null,
      updatedAt: now,
    };

    // Only overwrite structured fields when explicitly provided — prevents a
    // contact-info-only save from clobbering AI-parsed experience/skills.
    const structuredValues = {
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.competencies !== undefined && { competencies: JSON.stringify(data.competencies) }),
      ...(data.tools !== undefined && { tools: JSON.stringify(data.tools) }),
      ...(data.experience !== undefined && { experience: JSON.stringify(data.experience) }),
      ...(data.education !== undefined && { education: JSON.stringify(data.education) }),
      ...(data.certifications !== undefined && { certifications: JSON.stringify(data.certifications) }),
    };

    await db
      .insert(masterResume)
      .values({ ...baseValues, ...structuredValues })
      .onConflictDoUpdate({
        target: [masterResume.userId],
        set: { ...baseValues, ...structuredValues },
      });

    return { success: true, updatedAt: now };
  });

function extractBasicFields(text: string): Partial<ResumeData> {
  const result: Partial<ResumeData> = {};

  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
  if (firstLine && firstLine.trim().length < 80) result.fullName = firstLine.trim();

  const emailMatch = text.match(/[\w.+\-]+@[\w\-]+\.[\w.]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  const phoneMatch = text.match(/\(?\d{3}\)?[\s.\-•]\d{3}[\s.\-]\d{4}/);
  if (phoneMatch) result.phone = phoneMatch[0].trim();

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i);
  if (linkedinMatch) {
    result.linkedin = linkedinMatch[0].startsWith("http")
      ? linkedinMatch[0]
      : "https://" + linkedinMatch[0];
  }

  const urls = text.match(/https?:\/\/(?!(?:www\.)?linkedin\.com)[\w.\-]+\.[a-z]{2,}[/\w.\-?=&]*/gi);
  if (urls?.length) result.website = urls[0];

  return result;
}

export const parseResumeText = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => data)
  .handler(async ({ data }): Promise<Partial<ResumeData>> => {
    const regexFields = extractBasicFields(data.text);

    const env = getCloudflareEnv();
    if (!env.AI) return regexFields;

    const systemMsg = `You are a resume parser. Extract structured fields from raw resume text and return ONLY valid JSON. Never fabricate information — only extract what is explicitly present in the text.`;

    const userMsg = `Extract the following fields from this resume text. Return ONLY a JSON object with these fields (omit any field that isn't clearly present):

{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string (full URL)",
  "website": "string (full URL, not LinkedIn)",
  "summary": "string (professional summary or objective)",
  "competencies": ["string"],
  "tools": ["string (tools and technologies only)"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (bullets or prose)"
    }
  ],
  "education": [
    {
      "degree": "string",
      "fieldOfStudy": "string",
      "institution": "string",
      "graduationDate": "string"
    }
  ],
  "certifications": ["string"]
}

RESUME TEXT:
${data.text.slice(0, 12000)}`;

    try {
      const rawResponse = await callWorkersAI(env, [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ], { maxTokens: 3000 });

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return regexFields;

      let parsed: Partial<ResumeData>;
      try {
        parsed = JSON.parse(jsonMatch[0]) as Partial<ResumeData>;
      } catch {
        parsed = JSON.parse(jsonrepair(jsonMatch[0])) as Partial<ResumeData>;
      }

      // Regex fields win for contact info since they are exact-match extractions.
      return {
        ...parsed,
        fullName: regexFields.fullName ?? parsed.fullName,
        email: regexFields.email ?? parsed.email,
        phone: regexFields.phone ?? parsed.phone,
        linkedin: regexFields.linkedin ?? parsed.linkedin,
        website: regexFields.website ?? parsed.website,
      };
    } catch (err) {
      console.error("[parseResumeText] AI parse failed:", err);
      return regexFields;
    }
  });
