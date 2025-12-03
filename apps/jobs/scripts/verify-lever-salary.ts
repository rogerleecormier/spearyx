
import { fetchLeverJobs } from '../src/lib/job-sources/lever';

async function verifyLeverSalary() {
  console.log("Fetching Spotify jobs from Lever to verify salary extraction...");
  
  const generator = fetchLeverJobs(undefined, console.log, ['spotify'], 0, 10);
  
  for await (const jobs of generator) {
    console.log(`\nFound ${jobs.length} jobs. Checking for salary data...`);
    
    let salaryCount = 0;
    
    for (const job of jobs) {
      if (job.salary) {
        console.log(`✅ Found salary for "${job.title}": ${job.salary}`);
        salaryCount++;
      }
    }
    
    console.log(`\nSummary: Found salary for ${salaryCount} out of ${jobs.length} jobs.`);
    
    if (salaryCount > 0) {
      console.log("\n✨ Verification SUCCESS: Salary extraction is working!");
    } else {
      console.log("\n⚠️ Verification WARNING: No salary data found in this batch. This might be normal if the jobs don't list salary, or it could indicate extraction failure.");
      // Log one job to see what we missed
      if (jobs.length > 0) {
        console.log("Sample job description (first 200 chars):", jobs[0].description.substring(0, 200));
      }
    }
    
    break; // Only check the first batch
  }
}

verifyLeverSalary().catch(console.error);
