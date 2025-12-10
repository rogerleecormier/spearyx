/**
 * ATS Sync Worker (V3) - Self-Healing
 * Calls /api/v3/sync/ats with automatic retry on failure
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
      
      // Log status for debugging
      console.log(`[${timeStr}] Attempt ${attempt}: HTTP ${response.status} ${response.statusText}`);
      
      // Check content-type before parsing
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Capture the actual response body for debugging
        const bodyText = await response.text();
        const preview = bodyText.substring(0, 200);
        console.error(`[${timeStr}] Non-JSON response (${response.status}): ${preview}`);
        throw new Error(`Invalid response type: ${contentType.substring(0, 50)} (HTTP ${response.status})`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < MAX_RETRIES) {
        console.log(`[${timeStr}] ⚠️ Attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS * attempt}ms...`);
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
    
    console.log(`[${timeStr}] 🏢 ATS Sync Worker starting`);
    
    const url = `https://jobs.spearyx.com/api/v3/sync/ats`;
    
    try {
      const result = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, timeStr);
      
      if (result.success) {
        console.log(`[${timeStr}] ✅ ${result.source}/${result.company}: +${result.jobsAdded} added, ${result.jobsUpdated} updated (${result.duration}ms)`);
      } else {
        console.log(`[${timeStr}] ⚠️ ATS sync returned: ${result.error || 'no error message'}`);
      }
    } catch (error) {
      console.error(`[${timeStr}] ❌ ATS worker error after ${MAX_RETRIES} retries:`, error);
    }
  }
}
