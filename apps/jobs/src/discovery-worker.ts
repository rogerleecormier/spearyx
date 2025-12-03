export default {
  async scheduled(_event: any, _env: any, _ctx: any) {
    console.log("🔍 Discovery cron triggered");
    try {
      const response = await fetch("https://jobs.spearyx.com/api/v2/discover-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Discovery API returned ${response.status}: ${response.statusText}`);
        return;
      }
      
      const data = await response.json() as any;
      
      // Log detailed progress
      if (data.success) {
        console.log(`📊 Batch: companies ${data.batch?.startIndex}-${data.batch?.endIndex - 1}`);
        console.log(`✅ Discovered: ${data.discovered?.length || 0} companies`);
        console.log(`❌ Not found: ${data.notFound?.length || 0} companies`);
        
        // Log each discovered company
        if (data.discovered && data.discovered.length > 0) {
          data.discovered.forEach((company: any) => {
            console.log(`  ✓ ${company.slug}: ${company.remoteJobCount} remote jobs (${company.source})`);
          });
        }
        
        // Log not found companies
        if (data.notFound && data.notFound.length > 0) {
          console.log(`  Not found: ${data.notFound.join(', ')}`);
        }
        
        console.log(`📝 ${data.message}`);
      } else {
        console.error(`❌ Discovery failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("❌ Discovery cron failed:", error);
    }
  }
}
