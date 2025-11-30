/**
 * Cloudflare Workers Configuration
 * API endpoints for AI-powered features
 */

export const WORKER_CONFIG = {
  // Development
  dev: {
    endpoint: process.env.VITE_WORKER_DEV_URL || "http://localhost:8787",
    apiKey: process.env.VITE_WORKER_API_KEY || "dev-key",
  },
  // Production
  prod: {
    endpoint:
      process.env.VITE_WORKER_PROD_URL || "https://raci-worker.example.com",
    apiKey: process.env.VITE_WORKER_API_KEY || "",
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
