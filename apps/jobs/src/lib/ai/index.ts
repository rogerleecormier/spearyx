// Cloudflare Workers AI client wrapper

import { DEFAULT_MODEL, type AIEnv, type AIMessage, AI_MODELS } from './types';
import { JOB_INSIGHTS_PROMPT, SEMANTIC_SEARCH_PROMPT } from './prompts';

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

  const response = await env.AI.run(DEFAULT_MODEL, {
    messages: [
      { role: 'system', content: JOB_INSIGHTS_PROMPT },
      { role: 'user', content: userContent }
    ],
    max_tokens: 800,
    temperature: 0.3  // Lower temperature for more consistent JSON output
  });

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.response;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr.trim()) as JobInsights;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return a fallback response
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
  const response = await env.AI.run(DEFAULT_MODEL, {
    messages: [
      { role: 'system', content: SEMANTIC_SEARCH_PROMPT },
      { role: 'user', content: query }
    ],
    max_tokens: 300,
    temperature: 0.2
  });

  try {
    let jsonStr = response.response;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr.trim()) as ParsedSearchQuery;
  } catch (error) {
    console.error('Failed to parse search query:', error);
    // Fallback: treat input as simple keywords
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
