export default {
  async scheduled(event: any, env: any, ctx: any) {
    console.log("Discovery cron triggered");
    try {
      const response = await fetch("https://jobs.spearyx.com/api/v2/discover-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(`Discovery response: ${response.status}`);
      const data = await response.json();
      console.log(`Discovery result:`, data);
    } catch (error) {
      console.error("Discovery cron failed:", error);
    }
  }
}
