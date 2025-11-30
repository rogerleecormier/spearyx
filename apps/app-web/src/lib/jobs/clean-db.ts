import { db, schema } from '../../db/db'
import { eq } from 'drizzle-orm'

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  
  // Delete all jobs from RemoteOK (which have HTML)
  const deleted = await db
    .delete(schema.jobs)
    .where(eq(schema.jobs.sourceName, 'RemoteOK'))
  
  console.log('✅ Deleted RemoteOK jobs with HTML')
  console.log('💡 Now run: npm run sync-jobs')
  process.exit(0)
}

cleanDatabase().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
