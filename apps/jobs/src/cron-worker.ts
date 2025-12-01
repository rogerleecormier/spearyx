export default {
  async scheduled(event: any, env: any, ctx: any) {
    console.log("Cron triggered");
    try {
      const response = await fetch("https://jobs.spearyx.com/api/sync", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CRON_SECRET}`
        }
      });
      console.log(`Sync response: ${response.status}`);
      const text = await response.text();
      console.log(`Response body: ${text}`);
    } catch (error) {
      console.error("Cron failed:", error);
    }
  }
}
