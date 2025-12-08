/**
 * Discovery Sync Worker (V3) - Self-Healing
 * Calls /api/v3/sync/discovery with automatic retry on failure
 */

export interface Env {
  DB: D1Database;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, timeStr: string): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Check content-type before parsing
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Invalid response type: ${contentType.substring(0, 50)}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < MAX_RETRIES) {
        console.log(`[${timeStr}] ⚠️ Attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const startTime = new Date();
    const timeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    console.log(`[${timeStr}] 🔍 Discovery Sync Worker starting`);
    
    const url = `https://jobs.spearyx.com/api/v3/sync/discovery`;
    
    try {
      const result = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, timeStr);
      
      if (result.success) {
        console.log(`[${timeStr}] ✅ Discovery: checked ${result.companiesChecked}, discovered ${result.companiesAdded} (${result.duration}ms)`);
      } else {
        console.log(`[${timeStr}] ⚠️ Discovery returned: ${result.error || 'no error message'}`);
      }
    } catch (error) {
      console.error(`[${timeStr}] ❌ Discovery worker error after ${MAX_RETRIES} retries:`, error);
    }
  }
}
