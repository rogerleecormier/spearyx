import { db, schema } from '../../db/db'

async function checkGreenhouseData() {
  console.log('🔍 Checking a sample Greenhouse job...\n')
  
  const sampleJobs = await db.query.jobs.findMany({
    where: (jobs, { eq }) => eq(jobs.sourceName, 'Greenhouse'),
    limit: 3,
    with: {
      category: true
    }
  })
  
  if (sampleJobs.length === 0) {
    console.log('❌ No Greenhouse jobs found')
    process.exit(1)
  }
  
  sampleJobs.forEach((job, i) => {
    console.log(`\n📋 Sample Job ${i + 1}:`)
    console.log(`   Title: ${job.title}`)
    console.log(`   Company: ${job.company || '❌ MISSING'}`)
    console.log(`   Salary: ${job.payRange || '(not specified)'}`)
    console.log(`   Description: ${job.description ? '✅ Present (' + job.description.length + ' chars)' : '❌ MISSING'}`)
    console.log(`   Category: ${job.category.name}`)
    console.log(`   Source: ${job.sourceName}`)
  })
  
  const totalCount = await db.query.jobs.findMany({
    where: (jobs, { eq }) => eq(jobs.sourceName, 'Greenhouse')
  })
  
  console.log(`\n✅ Total Greenhouse jobs in database: ${totalCount.length}`)
  process.exit(0)
}

checkGreenhouseData()
