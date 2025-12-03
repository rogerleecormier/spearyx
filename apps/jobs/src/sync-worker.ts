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
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    console.log(`[${timeStr}] 🔄 ${type === 'job_sync' ? 'Batch sync' : 'Company discovery'} started`);
    
    try {
      const response = await fetch("https://jobs.spearyx.com/api/v2/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json() as any;
      
      // Log detailed progress based on type
      if (result.success) {
        if (type === 'job_sync') {
          // Log sync batch details
          if (result.batch) {
            console.log(`[${timeStr}] 📊 Processing batch: companies ${result.batch.startIndex}-${result.batch.endIndex - 1} of ${result.totalCompanies || '?'}`);
          }
          if (result.companies) {
            console.log(`[${timeStr}] 📋 Companies: ${result.companies.join(', ')}`);
          }
          if (result.jobBatchingEnabled !== undefined) {
            console.log(`[${timeStr}] ⚙️ Job batching enabled: Max ${result.maxJobsPerCompany || 20} jobs per company per sync run`);
          }
          if (result.results) {
            result.results.forEach((r: any) => {
              console.log(`Processing ${r.company}...`);
              if (r.success) {
                console.log(`  ✓ ${r.stats?.jobsAdded || 0} added, ${r.stats?.jobsUpdated || 0} updated, ${r.stats?.jobsDeleted || 0} deleted`);
              } else {
                console.log(`  ✗ Error: ${r.error}`);
              }
            });
          }
        } else {
          // Log discovery details
          if (result.batch) {
            console.log(`[${timeStr}] 📊 Checking companies ${result.batch.startIndex}-${result.batch.endIndex - 1}`);
          }
          if (result.discovered && result.discovered.length > 0) {
            result.discovered.forEach((company: any) => {
              console.log(`  ✓ ${company.slug}: ${company.remoteJobCount} remote jobs`);
            });
          }
          if (result.notFound && result.notFound.length > 0) {
            console.log(`  Not found: ${result.notFound.join(', ')}`);
          }
        }
        
        console.log(`[${timeStr}] ✅ ${result.message || 'Completed successfully'}`);
      } else {
        console.error(`[${timeStr}] ❌ ${type} failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`[${timeStr}] ❌ ${type} failed:`, error);
      // Don't throw - let cron continue on next schedule
    }
  }
}
