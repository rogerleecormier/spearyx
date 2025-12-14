// Cloudflare Workers AI types and utilities

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRunOptions {
  messages: AIMessage[];
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
}

export interface AIResponse {
  response: string;
}

// Define environment interface extension for AI
export interface AIEnv {
  AI: {
    run: (model: string, options: AIRunOptions) => Promise<AIResponse>;
  };
}

// Available models
export const AI_MODELS = {
  LLAMA_3_3_70B: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  LLAMA_3_1_8B: '@cf/meta/llama-3.1-8b-instruct-fp8',
  LLAMA_4_SCOUT: '@cf/meta/llama-4-scout-17b-16e-instruct',
} as const;

// Default model for job analysis tasks
export const DEFAULT_MODEL = AI_MODELS.LLAMA_3_3_70B;
