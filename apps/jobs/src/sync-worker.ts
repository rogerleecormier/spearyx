export interface Env {
  DB: D1Database;
}

export default {
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) {
    const minute = new Date().getMinutes();
    // Alternate between job sync and discovery based on time
    // 0-9, 20-29, 40-49: job_sync
    // 10-19, 30-39, 50-59: discovery
    const type = minute % 20 < 10 ? 'job_sync' : 'discovery';
    
    console.log(`[Sync Worker] Triggering ${type} at ${new Date().toISOString()}`);
    
    try {
      const response = await fetch("https://jobs.spearyx.com/api/v2/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`[Sync Worker] ${type} completed:`, result);
    } catch (error) {
      console.error(`[Sync Worker] ${type} failed:`, error);
      // Don't throw - let cron continue on next schedule
    }
  }
}
