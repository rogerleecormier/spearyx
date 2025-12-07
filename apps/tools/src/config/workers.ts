/**
 * AI Configuration for Azure Web Apps
 * 
 * AI features are disabled by default in production.
 * The RACI generator uses template-based fallback data instead.
 * 
 * To enable AI in the future, set VITE_AI_ENABLED=true and configure
 * the AI endpoint (e.g., Azure OpenAI Service).
 */

/**
 * Check if AI features are enabled
 * AI is disabled by default in production Azure deployment
 */
export const AI_ENABLED = import.meta.env.VITE_AI_ENABLED === "true";

export const WORKER_CONFIG = {
  // Development - AI can be enabled locally with a configured endpoint
  dev: {
    endpoint: import.meta.env.VITE_AI_ENDPOINT || "http://localhost:8787",
    apiKey: import.meta.env.VITE_AI_API_KEY || "dev-key",
  },
  // Production - Requires explicit configuration 
  prod: {
    endpoint: import.meta.env.VITE_AI_ENDPOINT || "",
    apiKey: import.meta.env.VITE_AI_API_KEY || "",
  },
};

export function getWorkerEndpoint(): string {
  const isDev = import.meta.env.DEV;
  return isDev ? WORKER_CONFIG.dev.endpoint : WORKER_CONFIG.prod.endpoint;
}

export function getWorkerApiKey(): string {
  const isDev = import.meta.env.DEV;
  return isDev ? WORKER_CONFIG.dev.apiKey : WORKER_CONFIG.prod.apiKey;
}

/**
 * AI request configuration
 */
export const AI_CONFIG = {
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
};
