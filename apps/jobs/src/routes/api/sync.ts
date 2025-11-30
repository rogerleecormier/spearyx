import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const Route = createFileRoute('/api/sync')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const startTime = Date.now()
          const results = {
            cleanup: { success: false, duration: 0, message: '' },
            discovery: { success: false, duration: 0, message: '' },
            sync: { success: false, duration: 0, message: '' }
          }

          // Step 1: Cleanup
          try {
            const cleanupStart = Date.now()
            await execAsync('npm run greenhouse:cleanup', {
              cwd: process.cwd(),
              maxBuffer: 10 * 1024 * 1024
            })
            results.cleanup = {
              success: true,
              duration: Date.now() - cleanupStart,
              message: 'Cleanup completed successfully'
            }
          } catch (error) {
            results.cleanup = {
              success: false,
              duration: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Cleanup failed'
            }
          }

          // Step 2: Discovery
          try {
            const discoveryStart = Date.now()
            await execAsync('npm run greenhouse:discover', {
              cwd: process.cwd(),
              maxBuffer: 10 * 1024 * 1024
            })
            results.discovery = {
              success: true,
              duration: Date.now() - discoveryStart,
              message: 'Discovery completed successfully'
            }
          } catch (error) {
            const discoveryDuration = Date.now() - startTime
            results.discovery = {
              success: false,
              duration: discoveryDuration,
              message: error instanceof Error ? error.message : 'Discovery failed'
            }
          }

          // Step 3: Sync jobs
          try {
            const syncStart = Date.now()
            await execAsync('npm run sync-jobs', {
              cwd: process.cwd(),
              maxBuffer: 10 * 1024 * 1024
            })
            results.sync = {
              success: true,
              duration: Date.now() - syncStart,
              message: 'Job sync completed successfully'
            }
          } catch (error) {
            const syncDuration = Date.now() - startTime
            results.sync = {
              success: false,
              duration: syncDuration,
              message: error instanceof Error ? error.message : 'Job sync failed'
            }
          }

          const totalDuration = Date.now() - startTime

          return json({
            success: results.cleanup.success && results.sync.success,
            data: {
              results,
              totalDuration,
              timestamp: new Date().toISOString()
            }
          })
        } catch (error) {
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
          )
        }
      }
    }
  }
})
