import { db, schema } from '../../db/db'
import { eq } from 'drizzle-orm'

async function clearGreenhouseJobs() {
  console.log('🧹 Clearing old Greenhouse jobs from database...')
  
  try {
    const result = await db.delete(schema.jobs)
      .where(eq(schema.jobs.sourceName, 'Greenhouse'))
    
    console.log('✅ Successfully cleared Greenhouse jobs')
    console.log('💡 Now run: npm run sync-jobs')
    console.log('   This will fetch fresh Greenhouse data with company names, descriptions, and salaries')
  } catch (error) {
    console.error('❌ Error clearing jobs:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

clearGreenhouseJobs()
