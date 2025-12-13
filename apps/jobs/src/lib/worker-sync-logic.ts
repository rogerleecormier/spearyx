/**
 * Worker Sync Logic
 * 
 * Shared sync logic for Cloudflare Workers that bypasses the HTTP layer
 * and writes directly to D1. This eliminates cold start issues from
 * hitting the TanStack website.
 */

import type { DrizzleD1Database } from '../db/db'
import * as schema from '../db/schema'
import { sql, eq } from 'drizzle-orm'
import { determineCategoryId } from './job-sources'

// Import company lists
import greenhouseCompanies from './job-sources/greenhouse-companies.json'
import leverCompanies from './job-sources/lever-companies.json'

// ============================================
// Types
// ============================================

interface CompanyDatabase {
  categories: { [key: string]: { companies: string[] } }
}

export interface SyncResult {
  success: boolean
  source: string
  company?: string
  tag?: string
  jobsAdded: number
  jobsUpdated: number
  error?: string
  duration: number
}

export interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

// ============================================
// Utility Functions
// ============================================

function getGreenhouseCompanies(): string[] {
  const data = greenhouseCompanies as CompanyDatabase
  const all: string[] = []
  Object.values(data.categories).forEach(cat => all.push(...cat.companies))
  return [...new Set(all)]
}

function getLeverCompanies(): string[] {
  const data = leverCompanies as CompanyDatabase
  const all: string[] = []
  Object.values(data.categories).forEach(cat => all.push(...cat.companies))
  return [...new Set(all)]
}

function createLog(type: LogEntry['type'], message: string): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    type,
    message
  }
}

// RemoteOK tags for rotation
const REMOTEOK_TAGS = [
  'dev', 'engineer', 'devops', 'design', 'marketing',
  'developer', 'frontend', 'backend', 'fullstack',
  'product', 'project', 'data', 'support'
]

// ============================================
// Error State Reporting
// ============================================

/**
 * Marks a sync as failed in the syncHistory table.
 * This ensures the UI shows 'failed' instead of stuck 'running'.
 */
export async function markSyncFailed(
  db: DrizzleD1Database,
  syncId: string,
  error: unknown,
  logs: LogEntry[] = []
): Promise<void> {
  const errorMsg = error instanceof Error ? error.message : String(error)
  
  try {
    await db.update(schema.syncHistory).set({
      status: 'failed',
      completedAt: new Date(),
      logs: [...logs, createLog('error', `Fatal error: ${errorMsg}`)].slice(0, 20),
      stats: { jobsAdded: 0, jobsUpdated: 0, jobsDeleted: 0, error: errorMsg } as any
    }).where(eq(schema.syncHistory.id, syncId))
  } catch (updateError) {
    console.error('Failed to mark sync as failed:', updateError)
  }
}

// ============================================
// ATS Sync Logic (Greenhouse/Lever)
// ============================================

export async function syncAtsCompany(
  db: DrizzleD1Database,
  timeStr: string
): Promise<SyncResult> {
  const syncId = crypto.randomUUID()
  const startTime = Date.now()
  const logs: LogEntry[] = []
  
  const log = (type: LogEntry['type'], message: string) => {
    logs.push(createLog(type, message))
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`[${timeStr}] ${emoji} ${message}`)
  }
  
  try {
    // Get batch state to determine which company to sync
    let batchState = await db.select()
      .from(schema.syncHistory)
      .where(sql`status = 'batch_state' AND sync_type = 'ats'`)
      .limit(1)
    
    let atsIndex = 0
    let lastSource: 'greenhouse' | 'lever' = 'lever'
    
    if (batchState.length > 0 && batchState[0].stats) {
      const state = batchState[0].stats as any
      atsIndex = state.atsIndex || 0
      lastSource = state.lastSource || 'lever'
    }
    
    // Alternate between sources
    const source = lastSource === 'greenhouse' ? 'lever' : 'greenhouse'
    const companies = source === 'greenhouse' ? getGreenhouseCompanies() : getLeverCompanies()
    
    // Get next company
    if (atsIndex >= companies.length) {
      atsIndex = 0
    }
    
    const company = companies[atsIndex]
    const nextIndex = atsIndex + 1
    
    log('info', `Starting sync for ${company}`)
    log('info', `Company index: ${atsIndex}/${companies.length}, source: ${source}`)
    
    // Create sync history record
    await db.insert(schema.syncHistory).values({
      id: syncId,
      syncType: 'job_sync',
      source: source,
      status: 'running',
      startedAt: new Date(),
      logs: [createLog('info', `Syncing ${company}`)],
      stats: { 
        jobsAdded: 0, 
        jobsUpdated: 0, 
        jobsDeleted: 0, 
        company,
        companyIndex: atsIndex,
        totalCompanies: companies.length
      } as any
    })
    
    let jobsAdded = 0
    let jobsUpdated = 0
    
    // Fetch jobs from source
    const apiUrl = source === 'greenhouse'
      ? `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`
      : `https://api.lever.co/v0/postings/${company}`
    
    log('info', `API: ${apiUrl}`)
    
    const response = await fetch(apiUrl)
    log('info', `HTTP ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        log('warning', `${company}: No job board found (HTTP 404)`)
        // Continue to update batch state
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } else {
      // Check content-type
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        log('warning', `${company}: Invalid content-type: ${contentType.substring(0, 50)}`)
      } else {
        const data = await response.json() as any
        const jobs = source === 'greenhouse' ? (data.jobs || []) : (data || [])
        
        log('info', `Total jobs from API: ${jobs.length}`)
        
        // Filter for remote jobs
        const remoteJobs = jobs.filter((job: any) => {
          if (source === 'greenhouse') {
            const loc = job.location?.name?.toLowerCase() || ''
            return loc.includes('remote') || loc.includes('anywhere')
          } else {
            const cats = job.categories || {}
            const loc = cats.location?.toLowerCase() || ''
            const commitment = cats.commitment?.toLowerCase() || ''
            return loc.includes('remote') || commitment.includes('remote')
          }
        })
        
        log('info', `Remote jobs filtered: ${remoteJobs.length}/${jobs.length}`)
        
        // Process jobs
        for (const job of remoteJobs) {
          const sourceUrl = source === 'greenhouse'
            ? job.absolute_url
            : job.hostedUrl
          
          if (!sourceUrl) continue
          
          // Check if exists
          const existing = await db.select()
            .from(schema.jobs)
            .where(eq(schema.jobs.sourceUrl, sourceUrl))
            .limit(1)
          
          const title = source === 'greenhouse' ? job.title : job.text
          const description = source === 'greenhouse'
            ? job.content || ''
            : job.descriptionPlain || job.description || ''
          
          // Extract post date from API response
          let postDate: Date | null = null
          if (source === 'greenhouse' && job.updated_at) {
            // Greenhouse uses ISO-8601 format
            postDate = new Date(job.updated_at)
          } else if (source === 'lever' && job.createdAt) {
            // Lever uses Unix timestamp in milliseconds
            postDate = new Date(job.createdAt)
          }
          
          const categoryId = determineCategoryId(title, description, [])
          
          if (existing.length > 0) {
            await db.update(schema.jobs).set({
              title,
              company,
              descriptionRaw: description,
              isCleansed: 0,
              updatedAt: new Date(),
              postDate: postDate || existing[0].postDate,  // Keep existing if no new date
              categoryId
            }).where(eq(schema.jobs.id, existing[0].id))
            jobsUpdated++
          } else {
            await db.insert(schema.jobs).values({
              title,
              company,
              descriptionRaw: description,
              isCleansed: 0,
              sourceUrl,
              sourceName: source === 'greenhouse' ? 'Greenhouse' : 'Lever',
              postDate: postDate || new Date(),  // Use current date as fallback
              categoryId,
              remoteType: 'fully_remote'
            })
            jobsAdded++
          }
        }
        
        log('success', `${company}: ${jobsAdded} added, ${jobsUpdated} updated`)
      }
    }
    
    // Update sync history success
    await db.update(schema.syncHistory).set({
      status: 'completed',
      completedAt: new Date(),
      logs: logs.slice(0, 30),
      stats: { 
        jobsAdded, 
        jobsUpdated, 
        jobsDeleted: 0, 
        company,
        companyIndex: atsIndex,
        totalCompanies: companies.length,
        durationMs: Date.now() - startTime
      } as any
    }).where(eq(schema.syncHistory.id, syncId))
    
    // Update batch state
    await updateAtsBatchState(db, source, nextIndex)
    
    return {
      success: true,
      source,
      company,
      jobsAdded,
      jobsUpdated,
      duration: Date.now() - startTime
    }
    
  } catch (error) {
    await markSyncFailed(db, syncId, error, logs)
    throw error
  }
}

async function updateAtsBatchState(db: DrizzleD1Database, source: string, nextIndex: number) {
  const existing = await db.select()
    .from(schema.syncHistory)
    .where(sql`status = 'batch_state' AND sync_type = 'ats'`)
    .limit(1)
  
  const state = {
    atsIndex: nextIndex,
    lastSource: source,
    lastUpdated: new Date().toISOString()
  }
  
  if (existing.length > 0) {
    await db.update(schema.syncHistory).set({
      stats: state as any,
      completedAt: new Date()
    }).where(sql`id = ${existing[0].id}`)
  } else {
    await db.insert(schema.syncHistory).values({
      id: crypto.randomUUID(),
      syncType: 'ats',
      status: 'batch_state',
      startedAt: new Date(),
      completedAt: new Date(),
      stats: state as any
    })
  }
}

// ============================================
// Aggregator Sync Logic (RemoteOK/Himalayas)
// ============================================

export async function syncAggregator(
  db: DrizzleD1Database,
  timeStr: string
): Promise<SyncResult> {
  const syncId = crypto.randomUUID()
  const startTime = Date.now()
  const logs: LogEntry[] = []
  
  const log = (type: LogEntry['type'], message: string) => {
    logs.push(createLog(type, message))
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`[${timeStr}] ${emoji} ${message}`)
  }
  
  try {
    // Get batch state
    let batchState = await db.select()
      .from(schema.syncHistory)
      .where(sql`status = 'batch_state' AND sync_type = 'aggregator'`)
      .limit(1)
    
    let lastSource: 'remoteok' | 'himalayas' = 'himalayas'
    let remoteokTagIndex = 0
    
    if (batchState.length > 0 && batchState[0].stats) {
      const state = batchState[0].stats as any
      lastSource = state.lastSource || 'himalayas'
      remoteokTagIndex = state.remoteokTagIndex || 0
    }
    
    const source = lastSource === 'remoteok' ? 'himalayas' : 'remoteok'
    const sourceName = source === 'remoteok' ? 'RemoteOK' : 'Himalayas'
    
    let currentTag = ''
    let apiUrl = ''
    
    if (source === 'remoteok') {
      currentTag = REMOTEOK_TAGS[remoteokTagIndex % REMOTEOK_TAGS.length]
      apiUrl = `https://remoteok.com/api?tag=${currentTag}`
      log('info', `Syncing ${sourceName} tag: ${currentTag} (index ${remoteokTagIndex}/${REMOTEOK_TAGS.length})`)
    } else {
      apiUrl = 'https://himalayas.app/jobs/api'
      log('info', `Starting ${sourceName} sync`)
    }
    
    log('info', `API: ${apiUrl}`)
    
    // Create sync history record
    await db.insert(schema.syncHistory).values({
      id: syncId,
      syncType: 'job_sync',
      source: source,
      status: 'running',
      startedAt: new Date(),
      logs: [createLog('info', `Syncing ${sourceName}${currentTag ? ` (${currentTag})` : ''}`)],
      stats: { 
        jobsAdded: 0, 
        jobsUpdated: 0, 
        jobsDeleted: 0, 
        tag: currentTag || null,
        tagIndex: source === 'remoteok' ? remoteokTagIndex : null,
        totalTags: source === 'remoteok' ? REMOTEOK_TAGS.length : null
      } as any
    })
    
    let jobsAdded = 0
    let jobsUpdated = 0
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'SpearyxJobBot/1.0 (https://jobs.spearyx.com)'
      }
    })
    
    log('info', `HTTP ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Check content-type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Invalid response type: ${contentType.substring(0, 50)} (expected JSON)`)
    }
    
    const data = await response.json() as any
    
    // Parse jobs based on source
    let jobs: any[] = []
    if (source === 'remoteok') {
      jobs = Array.isArray(data) ? data.filter((j: any) => j.id && j.position) : []
    } else {
      jobs = data.jobs || []
    }
    
    log('info', `Total jobs from API: ${jobs.length}`)
    
    // Limit to first 100 for performance
    const jobsToProcess = jobs.slice(0, 100)
    log('info', `Processing ${jobsToProcess.length} jobs`)
    
    for (const job of jobsToProcess) {
      try {
        const sourceUrl = source === 'remoteok'
          ? `https://remoteok.com/l/${job.id}`
          : job.applicationLink || job.url
        
        if (!sourceUrl) continue
        
        const title = source === 'remoteok' ? job.position : job.title
        const company = source === 'remoteok' ? job.company : job.companyName
        const description = source === 'remoteok'
          ? job.description || ''
          : job.description || ''
        
        // Extract post date from API response
        let postDate: Date | null = null
        if (source === 'remoteok' && job.date) {
          // RemoteOK uses Unix timestamp in seconds
          postDate = new Date(job.date * 1000)
        } else if (source === 'himalayas' && job.pubDate) {
          // Himalayas uses ISO date string
          postDate = new Date(job.pubDate)
        }
        
        // Check if exists
        const existing = await db.select()
          .from(schema.jobs)
          .where(eq(schema.jobs.sourceUrl, sourceUrl))
          .limit(1)
        
        const categoryId = determineCategoryId(title, description, job.tags || [])
        
        if (existing.length > 0) {
          await db.update(schema.jobs).set({
            title,
            company,
            descriptionRaw: description,
            isCleansed: 0,
            updatedAt: new Date(),
            postDate: postDate || existing[0].postDate,  // Keep existing if no new date
            categoryId
          }).where(eq(schema.jobs.id, existing[0].id))
          jobsUpdated++
        } else {
          await db.insert(schema.jobs).values({
            title,
            company,
            descriptionRaw: description,
            isCleansed: 0,
            sourceUrl,
            sourceName,
            postDate: postDate || new Date(),  // Use current date as fallback
            categoryId,
            remoteType: 'fully_remote'
          })
          jobsAdded++
        }
      } catch (jobError) {
        // Skip individual job errors (like UNIQUE constraint)
        if (!(jobError instanceof Error && jobError.message.includes('UNIQUE'))) {
          console.error('Job processing error:', jobError)
        }
      }
    }
    
    log('success', `${jobsAdded} added, ${jobsUpdated} updated`)
    
    // Update sync history success
    await db.update(schema.syncHistory).set({
      status: 'completed',
      completedAt: new Date(),
      logs: logs.slice(0, 20),
      stats: { jobsAdded, jobsUpdated, jobsDeleted: 0 } as any
    }).where(eq(schema.syncHistory.id, syncId))
    
    // Update batch state
    await updateAggregatorBatchState(db, source, remoteokTagIndex)
    
    return {
      success: true,
      source,
      tag: currentTag || undefined,
      jobsAdded,
      jobsUpdated,
      duration: Date.now() - startTime
    }
    
  } catch (error) {
    await markSyncFailed(db, syncId, error, logs)
    throw error
  }
}

async function updateAggregatorBatchState(db: DrizzleD1Database, source: string, remoteokTagIndex: number) {
  const existing = await db.select()
    .from(schema.syncHistory)
    .where(sql`status = 'batch_state' AND sync_type = 'aggregator'`)
    .limit(1)
  
  // Increment tag index if this was a RemoteOK sync
  const nextTagIndex = source === 'remoteok' 
    ? (remoteokTagIndex + 1) % REMOTEOK_TAGS.length 
    : (existing[0]?.stats as any)?.remoteokTagIndex || 0
  
  const state = {
    lastSource: source,
    remoteokTagIndex: nextTagIndex,
    lastUpdated: new Date().toISOString()
  }
  
  if (existing.length > 0) {
    await db.update(schema.syncHistory).set({
      stats: state as any,
      completedAt: new Date()
    }).where(sql`id = ${existing[0].id}`)
  } else {
    await db.insert(schema.syncHistory).values({
      id: crypto.randomUUID(),
      syncType: 'aggregator',
      status: 'batch_state',
      startedAt: new Date(),
      completedAt: new Date(),
      stats: state as any
    })
  }
}

// ============================================
// Discovery Sync Logic
// ============================================

export async function syncDiscovery(
  db: DrizzleD1Database,
  timeStr: string
): Promise<{ success: boolean; companiesChecked: number; companiesAdded: number; duration: number; error?: string }> {
  const syncId = crypto.randomUUID()
  const startTime = Date.now()
  const logs: LogEntry[] = []
  
  const log = (type: LogEntry['type'], message: string) => {
    logs.push(createLog(type, message))
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`[${timeStr}] ${emoji} ${message}`)
  }
  
  try {
    log('info', 'Starting company discovery')
    
    // Create sync history record
    await db.insert(schema.syncHistory).values({
      id: syncId,
      syncType: 'discovery',
      source: null,
      status: 'running',
      startedAt: new Date(),
      logs: [createLog('info', 'Starting discovery')],
      stats: { companiesAdded: 0, companiesChecked: 0 } as any
    })
    
    // Get pending potential companies
    const potentialCompanies = await db.select()
      .from(schema.potentialCompanies)
      .where(sql`status = 'pending' OR status IS NULL`)
      .limit(5)
    
    let companiesChecked = 0
    let companiesAdded = 0
    const discovered: string[] = []
    
    for (const potential of potentialCompanies) {
      companiesChecked++
      const slug = potential.slug
      
      try {
        // Try Greenhouse first
        const ghUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
        log('info', `Checking ${slug} - Greenhouse API`)
        const ghResponse = await fetch(ghUrl)
        
        if (ghResponse.ok) {
          const data = await ghResponse.json() as any
          const jobs = data.jobs || []
          log('info', `${slug}: Greenhouse HTTP ${ghResponse.status}, ${jobs.length} total jobs`)
          
          const remoteJobs = jobs.filter((j: any) => {
            const loc = j.location?.name?.toLowerCase() || ''
            return loc.includes('remote') || loc.includes('anywhere')
          })
          
          log('info', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
          
          if (remoteJobs.length > 0) {
            await db.insert(schema.discoveredCompanies).values({
              slug,
              name: slug,
              source: 'Greenhouse',
              remoteJobCount: remoteJobs.length
            }).onConflictDoNothing()
            
            companiesAdded++
            discovered.push(slug)
            log('success', `✓ Discovered ${slug} (Greenhouse, ${remoteJobs.length} remote jobs)`)
          }
        } else {
          log('info', `${slug}: Greenhouse HTTP ${ghResponse.status}`)
        }
        
        // Try Lever if Greenhouse didn't work
        if (!ghResponse.ok) {
          const lvUrl = `https://api.lever.co/v0/postings/${slug}`
          log('info', `Checking ${slug} - Lever API`)
          const lvResponse = await fetch(lvUrl)
          
          if (lvResponse.ok) {
            const jobs = await lvResponse.json() as any[]
            log('info', `${slug}: Lever HTTP ${lvResponse.status}, ${jobs.length} total jobs`)
            
            const remoteJobs = jobs.filter((j: any) => {
              const loc = j.categories?.location?.toLowerCase() || ''
              return loc.includes('remote')
            })
            
            log('info', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
            
            if (remoteJobs.length > 0) {
              await db.insert(schema.discoveredCompanies).values({
                slug,
                name: slug,
                source: 'Lever',
                remoteJobCount: remoteJobs.length
              }).onConflictDoNothing()
              
              companiesAdded++
              discovered.push(slug)
              log('success', `✓ Discovered ${slug} (Lever, ${remoteJobs.length} remote jobs)`)
            }
          } else {
            log('info', `${slug}: Lever HTTP ${lvResponse.status}`)
          }
        }
        
        // Mark as checked
        await db.update(schema.potentialCompanies).set({
          status: discovered.includes(slug) ? 'discovered' : 'not_found',
          lastCheckedAt: new Date(),
          checkCount: (potential.checkCount || 0) + 1
        }).where(eq(schema.potentialCompanies.id, potential.id))
        
      } catch (checkError) {
        log('warning', `Error checking ${slug}: ${checkError}`)
      }
    }
    
    log('success', `Checked ${companiesChecked}, discovered ${companiesAdded}`)
    
    // Update sync history
    await db.update(schema.syncHistory).set({
      status: 'completed',
      completedAt: new Date(),
      logs: logs.slice(0, 20),
      stats: { companiesAdded, companiesChecked } as any
    }).where(eq(schema.syncHistory.id, syncId))
    
    return {
      success: true,
      companiesChecked,
      companiesAdded,
      duration: Date.now() - startTime
    }
    
  } catch (error) {
    await markSyncFailed(db, syncId, error, logs)
    throw error
  }
}
