import { db, schema } from './src/db/db'
import { eq, and, isNotNull, not } from 'drizzle-orm'

async function checkDatabaseContent() {
  console.log('🔍 Checking Greenhouse jobs in database...')
  
  const jobs = await db.query.jobs.findMany({
    where: eq(schema.jobs.sourceName, 'Greenhouse'),
    limit: 5,
    columns: {
      id: true,
      title: true,
      company: true,
      payRange: true,
      description: true
    }
  })
  
  console.log(`Found ${jobs.length} sample jobs.`)
  
  for (const job of jobs) {
    console.log('---------------------------------------------------')
    console.log(`Title: ${job.title}`)
    console.log(`Company: ${job.company}`)
    console.log(`Pay Range: ${job.payRange || 'MISSING'}`)
    console.log(`Description Length: ${job.description?.length || 0}`)
    console.log(`Description Preview: ${job.description?.substring(0, 100).replace(/\n/g, ' ') || 'MISSING'}...`)
    
    // Check for potential salary info
    if (job.description && job.description.includes('$')) {
      const dollarIndex = job.description.indexOf('$')
      console.log(`Potential Salary Context: ...${job.description.substring(dollarIndex - 20, dollarIndex + 50).replace(/\n/g, ' ')}...`)
    }
  }
  
  // Check stats
  const totalGreenhouse = await db.$count(schema.jobs, eq(schema.jobs.sourceName, 'Greenhouse'))
  const withSalary = await db.$count(schema.jobs, and(
    eq(schema.jobs.sourceName, 'Greenhouse'), 
    isNotNull(schema.jobs.payRange),
    not(eq(schema.jobs.payRange, ''))
  ))
  const withDescription = await db.$count(schema.jobs, and(
    eq(schema.jobs.sourceName, 'Greenhouse'), 
    isNotNull(schema.jobs.description),
    not(eq(schema.jobs.description, ''))
  ))
  
  console.log('---------------------------------------------------')
  console.log(`Total Greenhouse Jobs: ${totalGreenhouse}`)
  console.log(`With Salary: ${withSalary} (${((withSalary/totalGreenhouse)*100).toFixed(1)}%)`)
  console.log(`With Description: ${withDescription} (${((withDescription/totalGreenhouse)*100).toFixed(1)}%)`)
  
  process.exit(0)
}

checkDatabaseContent().catch(console.error)
