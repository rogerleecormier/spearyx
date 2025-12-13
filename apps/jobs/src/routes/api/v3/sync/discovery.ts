/**
 * V3 Discovery Sync Endpoint
 * Discovers new companies from potential_companies table
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../../db/db'
import { sql, eq } from 'drizzle-orm'
import { syncQueue, withRetry } from '../../../../lib/sync-queue'

export const Route = createFileRoute('/api/v3/sync/discovery')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        const syncId = crypto.randomUUID()
        const startTime = Date.now()
        
        try {
          const ctx = context as any
          let db;
          
          // Try to get DB connection with explicit error handling
          try {
            db = await getDbFromContext(ctx)
          } catch (dbError) {
            const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
            console.error('[Discovery Sync] DB connection failed:', dbErrorMsg)
            return json({
              success: false,
              error: `Database connection failed: ${dbErrorMsg}`,
              duration: Date.now() - startTime
            }, { status: 500 })
          }
          
          // Clear logs for this sync run
          syncQueue.clearLogs()
          syncQueue.log('info', 'discovery', 'Starting company discovery')
          
          // Create sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'discovery',
            source: null,
            status: 'running',
            startedAt: new Date(),
            logs: [{ timestamp: new Date().toISOString(), type: 'info', message: 'Starting discovery' }],
            stats: { companiesAdded: 0, companiesChecked: 0 }
          })
          
          // Get pending potential companies
          const potentialCompanies = await db.select()
            .from(schema.potentialCompanies)
            .where(sql`status = 'pending' OR status IS NULL`)
            .limit(5)  // Process 5 at a time
          
          let companiesChecked = 0
          let companiesAdded = 0
          let companiesUpdated = 0
          const discovered: string[] = []
          const notFound: string[] = []
          
          // Generate slug variations for multi-word company names
          const generateSlugVariations = (slug: string): string[] => {
            const variations = new Set<string>()
            variations.add(slug.toLowerCase())
            
            // If slug has hyphens, also try underscore and no separator
            if (slug.includes('-')) {
              variations.add(slug.replace(/-/g, '_').toLowerCase())
              variations.add(slug.replace(/-/g, '').toLowerCase())
              // CamelCase: hugging-face -> HuggingFace
              const camel = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
              variations.add(camel)
              variations.add(camel.toLowerCase())
            }
            
            // If slug has underscores, also try hyphen and no separator
            if (slug.includes('_')) {
              variations.add(slug.replace(/_/g, '-').toLowerCase())
              variations.add(slug.replace(/_/g, '').toLowerCase())
              const camel = slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
              variations.add(camel)
              variations.add(camel.toLowerCase())
            }
            
            // If no separators but has capital letters (CamelCase), split and try variations
            if (!slug.includes('-') && !slug.includes('_') && /[A-Z]/.test(slug)) {
              const words = slug.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
              variations.add(words) // camelCase -> camel-case
              variations.add(words.replace(/-/g, '_')) // camelCase -> camel_case
              variations.add(words.replace(/-/g, '')) // camelCase -> camelcase
            }
            
            return Array.from(variations)
          }
          
          for (const potential of potentialCompanies) {
            companiesChecked++
            const baseSlug = potential.slug
            const slugVariations = generateSlugVariations(baseSlug)
            let foundOnAnySource = false
            
            try {
              // Try each slug variation until we find a match
              slugLoop: for (const slug of slugVariations) {
                if (foundOnAnySource) break
                
                // Try Greenhouse
                const ghUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
                const ghResponse = await fetch(ghUrl)
                
                if (ghResponse.ok) {
                  const data = await ghResponse.json() as any
                  const jobs = data.jobs || []
                  syncQueue.log('info', 'discovery', `${slug}: Greenhouse HTTP ${ghResponse.status}, ${jobs.length} total jobs`)
                  const remoteJobs = jobs.filter((j: any) => {
                    const loc = j.location?.name?.toLowerCase() || ''
                    return loc.includes('remote') || loc.includes('anywhere')
                  })
                  
                  syncQueue.log('info', 'discovery', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
                  
                  // Check if exists
                  const existing = await db.select().from(schema.discoveredCompanies).where(eq(schema.discoveredCompanies.slug, slug)).limit(1)
                  const isNew = existing.length === 0

                  // Add company if we got a valid response (account exists on this ATS)
                  await db.insert(schema.discoveredCompanies).values({
                    slug,
                    name: baseSlug,
                    source: 'Greenhouse',
                    jobCount: jobs.length,
                    remoteJobCount: remoteJobs.length
                  }).onConflictDoUpdate({
                    target: schema.discoveredCompanies.slug,
                    set: {
                      source: 'Greenhouse',
                      jobCount: jobs.length,
                      remoteJobCount: remoteJobs.length,
                      updatedAt: new Date()
                    }
                  })
                  
                  if (isNew) {
                    companiesAdded++
                    syncQueue.log('success', 'discovery', `✓ Discovered ${baseSlug} as ${slug} (Greenhouse, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  } else {
                    companiesUpdated++
                    syncQueue.log('success', 'discovery', `↻ Updated ${baseSlug} as ${slug} (Greenhouse, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  }

                  discovered.push(baseSlug)
                  foundOnAnySource = true
                  break slugLoop
                } else {
                  syncQueue.log('info', 'discovery', `${slug}: Greenhouse HTTP ${ghResponse.status}`)
                }
                
                // Try Lever
                const lvUrl = `https://api.lever.co/v0/postings/${slug}`
                const lvResponse = await fetch(lvUrl)
                
                if (lvResponse.ok) {
                  const jobs = await lvResponse.json() as any[]
                  syncQueue.log('info', 'discovery', `${slug}: Lever HTTP ${lvResponse.status}, ${jobs.length} total jobs`)
                  const remoteJobs = jobs.filter((j: any) => {
                    const loc = j.categories?.location?.toLowerCase() || ''
                    return loc.includes('remote')
                  })
                  
                  syncQueue.log('info', 'discovery', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
                  
                  // Check if exists
                  const existing = await db.select().from(schema.discoveredCompanies).where(eq(schema.discoveredCompanies.slug, slug)).limit(1)
                  const isNew = existing.length === 0

                  // Add company if we got a valid response (account exists on this ATS)
                  await db.insert(schema.discoveredCompanies).values({
                    slug,
                    name: baseSlug,
                    source: 'Lever',
                    jobCount: jobs.length,
                    remoteJobCount: remoteJobs.length
                  }).onConflictDoUpdate({
                    target: schema.discoveredCompanies.slug,
                    set: {
                      source: 'Lever',
                      jobCount: jobs.length,
                      remoteJobCount: remoteJobs.length,
                      updatedAt: new Date()
                    }
                  })
                  
                  if (isNew) {
                    companiesAdded++
                    syncQueue.log('success', 'discovery', `✓ Discovered ${baseSlug} as ${slug} (Lever, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  } else {
                    companiesUpdated++
                    syncQueue.log('success', 'discovery', `↻ Updated ${baseSlug} as ${slug} (Lever, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  }

                  discovered.push(baseSlug)
                  foundOnAnySource = true
                  break slugLoop
                } else {
                  syncQueue.log('info', 'discovery', `${slug}: Lever HTTP ${lvResponse.status}`)
                }
                
                // Try Workable
                const wkUrl = `https://apply.workable.com/api/v1/widget/accounts/${slug}`
                const wkResponse = await fetch(wkUrl)
                
                if (wkResponse.ok) {
                  const data = await wkResponse.json() as any
                  const jobs = data.jobs || []
                  syncQueue.log('info', 'discovery', `${slug}: Workable HTTP ${wkResponse.status}, ${jobs.length} total jobs`)
                  const remoteJobs = jobs.filter((j: any) => {
                    const isRemote = j.telecommuting === true
                    const titleLower = j.title?.toLowerCase() || ''
                    return isRemote || titleLower.includes('remote')
                  })
                  
                  syncQueue.log('info', 'discovery', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
                  
                  // Check if exists
                  const existing = await db.select().from(schema.discoveredCompanies).where(eq(schema.discoveredCompanies.slug, slug)).limit(1)
                  const isNew = existing.length === 0

                  // Add company if we got a valid response (account exists on this ATS)
                  await db.insert(schema.discoveredCompanies).values({
                    slug,
                    name: data.name || baseSlug,
                    source: 'Workable',
                    jobCount: jobs.length,
                    remoteJobCount: remoteJobs.length
                  }).onConflictDoUpdate({
                    target: schema.discoveredCompanies.slug,
                    set: {
                      source: 'Workable',
                      jobCount: jobs.length,
                      remoteJobCount: remoteJobs.length,
                      updatedAt: new Date()
                    }
                  })
                  
                  if (isNew) {
                    companiesAdded++
                    syncQueue.log('success', 'discovery', `✓ Discovered ${baseSlug} as ${slug} (Workable, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  } else {
                    companiesUpdated++
                    syncQueue.log('success', 'discovery', `↻ Updated ${baseSlug} as ${slug} (Workable, ${jobs.length} jobs, ${remoteJobs.length} remote)`)
                  }

                  discovered.push(baseSlug)
                  foundOnAnySource = true
                  break slugLoop
                } else {
                  syncQueue.log('info', 'discovery', `${slug}: Workable HTTP ${wkResponse.status}`)
                }
              }
              
              // Mark as checked
              await db.update(schema.potentialCompanies).set({
                status: foundOnAnySource ? 'discovered' : 'not_found',
                lastCheckedAt: new Date(),
                checkCount: (potential.checkCount || 0) + 1
              }).where(eq(schema.potentialCompanies.id, potential.id))
              
              if (!foundOnAnySource) {
                notFound.push(baseSlug)
              }
              
            } catch (checkError) {
              syncQueue.log('warning', 'discovery', `Error checking ${baseSlug}: ${checkError}`)
            }
          }
          
          syncQueue.log('success', 'discovery', `Checked ${companiesChecked}, discovered ${companiesAdded}, updated ${companiesUpdated}`)
          
          // Update sync history
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: syncQueue.getLogs().slice(0, 200),
            stats: { companiesAdded, companiesUpdated, companiesChecked }
          }).where(eq(schema.syncHistory.id, syncId))
          
          return json({
            success: true,
            companiesChecked,
            companiesAdded,
            companiesUpdated,
            discovered,
            notFound,
            duration: Date.now() - startTime
          })
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          syncQueue.log('error', 'discovery', `Fatal error: ${errorMsg}`)
          
          try {
            const ctx = context as any
            const db = await getDbFromContext(ctx)
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: syncQueue.getLogs().slice(0, 20)
            }).where(eq(schema.syncHistory.id, syncId))
          } catch {}
          
          return json({
            success: false,
            error: errorMsg,
            duration: Date.now() - startTime
          }, { status: 500 })
        }
      }
    }
  }
})
