/**
 * Jobicy Sync Worker - Direct D1 Access
 * 
 * Syncs jobs from Jobicy API directly to D1.
 * Runs every 60 minutes to comply with fair use policy.
 */

import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'
import { syncAggregator } from '../lib/worker-sync-logic'

export interface Env {
  DB: D1Database;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const startTime = new Date()
    const timeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    
    console.log(`[${timeStr}] 🟠 Jobicy Sync Worker starting`)
    
    const db = drizzle(env.DB, { schema })
    
    try {
      // Force Jobicy source
      const result = await syncAggregator(db, timeStr, 'jobicy')
      
      if (result.success) {
        const tagInfo = result.tag ? ` (${result.tag})` : ''
        console.log(`[${timeStr}] ✅ Jobicy${tagInfo}: +${result.jobsAdded} added, ${result.jobsUpdated} updated (${result.duration}ms)`)
      } else {
        console.log(`[${timeStr}] ⚠️ Jobicy sync returned: ${result.error || 'no error message'}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[${timeStr}] ❌ Jobicy sync failed:`, errorMsg)
    }
  }
}
