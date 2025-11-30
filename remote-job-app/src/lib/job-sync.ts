import { db, schema } from '../db/db'
import { jobSources, determineCategoryId } from './job-sources'
import { eq } from 'drizzle-orm'

export async function syncJobs(options: { 
  updateExisting: boolean
  addNew: boolean
  sources?: string[]
} = { updateExisting: true, addNew: true }) {
  console.log('='.repeat(50))
  console.log('Starting job sync...')
  if (options.sources && options.sources.length > 0) {
    console.log(`Syncing sources: ${options.sources.join(', ')}`)
  }
  console.log('='.repeat(50))
  
  let totalAdded = 0
  let totalUpdated = 0
  let totalSkipped = 0
  
  // Filter sources if specified
  const sourcesToSync = options.sources && options.sources.length > 0
    ? jobSources.filter(source => options.sources!.includes(source.name))
    : jobSources
  
  for (const source of sourcesToSync) {
    try {
      console.log(`\n📡 Fetching from ${source.name}...`)
      
      for await (const rawJobs of source.fetch()) {
        console.log(`Processing batch of ${rawJobs.length} jobs from ${source.name}`)
        
        for (const rawJob of rawJobs) {
          try {
            // Check if job already exists by source URL
            const existing = await db.query.jobs.findFirst({
              where: eq(schema.jobs.sourceUrl, rawJob.sourceUrl)
            })
            
            // Determine category automatically
            const categoryId = determineCategoryId(
              rawJob.title,
              rawJob.description,
              rawJob.tags
            )

            if (existing) {
              if (options.updateExisting) {
                // Update existing job with potentially new data
                await db.update(schema.jobs)
                  .set({
                    title: rawJob.title,
                    company: rawJob.company || null,
                    description: rawJob.description || null,
                    payRange: rawJob.salary || null,
                    postDate: rawJob.postedDate,
                    updatedAt: new Date(),
                    categoryId // Update category as logic might have changed
                  })
                  .where(eq(schema.jobs.id, existing.id))

                totalUpdated++
                console.log(`  🔄 Updated: ${rawJob.title}`)
              }
              continue
            }
            
            if (options.addNew) {
              // Insert new job
              await db.insert(schema.jobs).values({
                title: rawJob.title,
                company: rawJob.company || null,
                description: rawJob.description || null,
                payRange: rawJob.salary || null,
                postDate: rawJob.postedDate,
                sourceUrl: rawJob.sourceUrl,
                sourceName: rawJob.sourceName,
                categoryId,
                remoteType: 'fully_remote'
              })
              
              totalAdded++
              console.log(`  ✅ Added: ${rawJob.title} (Category: ${categoryId})`)
            }
          } catch (jobError) {
            console.error(`  ❌ Error processing job "${rawJob.title}":`, jobError)
          }
        }
      }
      
      console.log(`\n✨ ${source.name} complete`)
    } catch (sourceError) {
      console.error(`❌ Error fetching from ${source.name}:`, sourceError)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('\n✅ Sync complete!')
  console.log(`   Added: ${totalAdded}`)
  console.log(`   Updated: ${totalUpdated}`)
  console.log(`   Skipped: ${totalSkipped}`)
  console.log('='.repeat(50))
  
  return {
    added: totalAdded,
    updated: totalUpdated,
    skipped: totalSkipped
  }
}

// Parse command line arguments and environment variables
const args = process.argv.slice(2)
const updateExisting = process.env.UPDATE_EXISTING !== 'false' && !args.includes('--no-update')
const addNew = process.env.ADD_NEW !== 'false' && !args.includes('--no-new')

// Parse sources from environment variable
const sourcesEnv = process.env.SOURCES
const sources = sourcesEnv && sourcesEnv.trim() !== '' ? sourcesEnv.split(',').map(s => s.trim()) : undefined

// Auto-execute when run as a script
syncJobs({ updateExisting, addNew, sources })
  .then(() => {
    console.log('\n✅ Sync finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error)
    process.exit(1)
  })
