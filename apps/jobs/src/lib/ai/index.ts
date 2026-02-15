// Cloudflare Workers AI client wrapper

import { DEFAULT_MODEL, type AIEnv } from './types';
import { JOB_INSIGHTS_PROMPT, SEMANTIC_SEARCH_PROMPT } from './prompts';

/**
 * Robust helper to get AI binding from context, including dev mode proxying
 */
export async function getAIFromContext(context: any): Promise<AIEnv['AI'] | null> {
  // 1. Standard Cloudflare context (production)
  let ai = context?.cloudflare?.env?.AI;

  if (!ai) ai = context?.env?.AI;
  if (!ai) ai = context?.AI;

  // 2. Check global __CF_ENV__ (set by custom worker entry)
  if (!ai && typeof globalThis !== 'undefined') {
    const cfEnv = (globalThis as any).__CF_ENV__;
    if (cfEnv) ai = cfEnv.AI;
  }

  // 3. Check direct on globalThis
  if (!ai && typeof globalThis !== 'undefined') {
    ai = (globalThis as any).AI;
  }

  // 4. Development mode - use getPlatformProxy to connect to remote AI
  if (!ai && (import.meta.env?.DEV || process.env.NODE_ENV === 'development')) {
    try {
      // Use vite-ignore to prevent bundling wrangler in the client
      const { getPlatformProxy } = await import(/* @vite-ignore */ 'wrangler');
      const proxy = await getPlatformProxy({
        configPath: './wrangler.toml',
      });
      // @ts-ignore
      ai = proxy.env.AI;
    } catch (error) {
      console.error('[AI] Failed to get platform proxy:', error);
    }
  }

  return ai || null;
}

// Job Insights types
export interface JobInsights {
  estimatedSalary: {
    min: number | null;
    max: number | null;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
  };
  cultureSignals: Array<{
    signal: string;
    interpretation: string;
    sentiment: 'positive' | 'neutral' | 'warning';
  }>;
  redFlags: Array<{
    flag: string;
    reason: string;
  }>;
  workLifeBalance: 'excellent' | 'good' | 'moderate' | 'demanding' | 'unknown';
  remoteFlexibility: 'fully_remote' | 'hybrid' | 'office' | 'unknown';
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown';
  keyRequirements: string[];
  niceToHaves: string[];
  summary: string;
}

// Semantic Search types
export interface ParsedSearchQuery {
  keywords: string[];
  skills: string[];
  jobType: string | null;
  seniorityLevel: string | null;
  companyType: string | null;
  preferences: {
    workLifeBalance: boolean;
    remote: boolean;
    highPaying: boolean;
  };
  excludeTerms: string[];
}

/**
 * Analyze a job posting and extract insights
 */
export async function analyzeJobInsights(
  env: AIEnv,
  jobDescription: string,
  jobTitle?: string
): Promise<JobInsights> {
  const userContent = jobTitle
    ? `Job Title: ${jobTitle}\n\nJob Description:\n${jobDescription}`
    : jobDescription;

  try {
    const response = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: JOB_INSIGHTS_PROMPT },
        { role: 'user', content: userContent }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    let responseText = "";
    const res = response as any;
    if (res?.choices?.[0]?.message) {
      responseText = res.choices[0].message.content || res.choices[0].message.reasoning_content || "";
    } else if (res?.response) {
      responseText = res.response;
    } else if (typeof response === "string") {
      responseText = response;
    } else {
      responseText = JSON.stringify(response);
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Find the first { and last }
      const bracketMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (bracketMatch) jsonStr = bracketMatch[0];
    }

    return JSON.parse(jsonStr.trim()) as JobInsights;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      estimatedSalary: { min: null, max: null, currency: 'USD', confidence: 'low' },
      cultureSignals: [],
      redFlags: [],
      workLifeBalance: 'unknown',
      remoteFlexibility: 'unknown',
      seniorityLevel: 'unknown',
      keyRequirements: [],
      niceToHaves: [],
      summary: 'Unable to analyze this job posting.'
    };
  }
}

/**
 * Parse natural language search query into structured filters
 */
export async function parseSearchQuery(
  env: AIEnv,
  query: string
): Promise<ParsedSearchQuery> {
  try {
    const response = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: SEMANTIC_SEARCH_PROMPT },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.2
    });

    let responseText = "";
    const res = response as any;
    if (res?.choices?.[0]?.message) {
      responseText = res.choices[0].message.content || res.choices[0].message.reasoning_content || "";
    } else if (res?.response) {
      responseText = res.response;
    } else if (typeof response === "string") {
      responseText = response;
    } else {
      responseText = JSON.stringify(response);
    }

    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const bracketMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (bracketMatch) jsonStr = bracketMatch[0];
    }

    return JSON.parse(jsonStr.trim()) as ParsedSearchQuery;
  } catch (error) {
    console.error('Failed to parse search query:', error);
    return {
      keywords: query.split(/\s+/).filter(w => w.length > 2),
      skills: [],
      jobType: null,
      seniorityLevel: null,
      companyType: null,
      preferences: { workLifeBalance: false, remote: false, highPaying: false },
      excludeTerms: []
    };
  }
}

// Re-export types
export * from './types';
export * from './prompts';
