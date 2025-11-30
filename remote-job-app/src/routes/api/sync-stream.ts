import { createFileRoute } from '@tanstack/react-router'
import { spawn } from 'child_process'
import { createSync, addSyncLog, completeSync, getSync, subscribeToSync, unsubscribeFromSync } from '../../lib/sync-state'
import { createSyncReport, updateDiscoveryStats, updateJobStats, finalizeSyncReport, formatSyncReport, parseDiscoveryOutput, parseJobSyncOutput, addTopJob } from '../../lib/sync-report'
import type { SyncReport } from '../../lib/sync-report'

export const Route = createFileRoute('/api/sync-stream')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const cleanup = url.searchParams.get('cleanup') === 'true'
        const discovery = url.searchParams.get('discovery') === 'true'
        const maintenance = url.searchParams.get('maintenance') === 'true'
        const updateExisting = url.searchParams.get('updateExisting') === 'true'
        const addNew = url.searchParams.get('addNew') === 'true'
        const sourcesParam = url.searchParams.get('sources')
        const sources = sourcesParam ? sourcesParam.split(',') : undefined
        const reconnectId = url.searchParams.get('syncId')
        
        const encoder = new TextEncoder()
        let isControllerClosed = false
        
        const stream = new ReadableStream({
          async start(controller) {
            const sendEvent = (data: any) => {
              if (isControllerClosed) return
              try {
                const message = `data: ${JSON.stringify(data)}\n\n`
                controller.enqueue(encoder.encode(message))
              } catch (error) {
                console.error('Error sending event:', error)
                isControllerClosed = true
              }
            }

            // Handle client disconnect
            request.signal.addEventListener('abort', () => {
              isControllerClosed = true
              try {
                controller.close()
              } catch (e) {
                // Ignore if already closed
              }
            })

            // If reconnecting to existing sync
            if (reconnectId) {
              const existingSync = getSync(reconnectId)
              if (existingSync) {
                sendEvent({ type: 'reconnect', syncId: reconnectId })
                
                // Send history
                existingSync.logs.forEach(log => {
                  sendEvent({ type: 'log', message: log.message, level: log.type })
                })
                
                if (existingSync.status === 'complete') {
                  const duration = existingSync.endTime! - existingSync.startTime
                  sendEvent({ type: 'complete', duration })
                  controller.close()
                  return
                } else if (existingSync.status === 'error') {
                  sendEvent({ type: 'error', message: existingSync.error || 'Unknown error' })
                  controller.close()
                  return
                }
                
                // If still running, subscribe to updates
                const listener = (event: any) => {
                  sendEvent(event)
                  if (event.type === 'complete' || event.type === 'error') {
                    controller.close()
                    unsubscribeFromSync(reconnectId, listener)
                  }
                }
                
                subscribeToSync(reconnectId, listener)
                
                // Cleanup listener on abort
                request.signal.addEventListener('abort', () => {
                  unsubscribeFromSync(reconnectId, listener)
                })
                
                return
              } else {
                sendEvent({ type: 'error', message: 'Sync session not found' })
                controller.close()
                return
              }
            }

            // Create new sync state
            const syncState = createSync(cleanup || discovery || updateExisting || addNew || maintenance)
            sendEvent({ type: 'sync_started', syncId: syncState.id })

            // Subscribe to updates immediately
            const listener = (event: any) => {
              sendEvent(event)
              if (event.type === 'complete' || event.type === 'error') {
                // Don't close controller here for the main process, let the finally block handle it?
                // Actually, the listener is the source of truth now.
                // But we also have the process running below.
                // The process updates state, which triggers listener.
                // So we can rely on listener for stream updates.
              }
            }
            subscribeToSync(syncState.id, listener)
            
            request.signal.addEventListener('abort', () => {
              unsubscribeFromSync(syncState.id, listener)
            })

            const sendLog = (message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') => {
              addSyncLog(syncState.id, message, level)
              // No need to call sendEvent here, the listener will handle it
            }

            try {
              const startTime = Date.now()
              
              // Create sync report
              const syncReport = createSyncReport()
              syncState.report = syncReport
              
              sendLog('🚀 Starting job sync process...', 'info')
              sendLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
              sendLog('', 'info')

              // Helper to run command and stream output
              const runCommand = (command: string, args: string[], stepName: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                  // Check if aborted before starting
                  if (request.signal.aborted) {
                    reject(new Error('Aborted'))
                    return
                  }
                  
                  let output = ''

                  const proc = spawn(command, args, {
                    cwd: process.cwd(),
                    shell: true
                  })
                  
                  // Don't kill process if client disconnects - let it run in background
                  // We just stop listening to the abort signal for killing purposes
                  // const abortHandler = () => {
                  //   proc.kill()
                  // }
                  // request.signal.addEventListener('abort', abortHandler)

                  proc.stdout?.on('data', (data) => {
                    const text = data.toString()
                    output += text
                    const lines = text.split('\n')
                    lines.forEach((line: string) => {
                      if (line.trim()) {
                        sendLog(line, 'info')
                      }
                    })
                  })

                  proc.stderr?.on('data', (data) => {
                    const text = data.toString()
                    output += text
                    const lines = text.split('\n')
                    lines.forEach((line: string) => {
                      if (line.trim()) {
                        sendLog(line, 'warning')
                      }
                    })
                  })

                  proc.on('error', (error) => {
                    // request.signal.removeEventListener('abort', abortHandler)
                    sendLog(`Error in ${stepName}: ${error.message}`, 'error')
                    reject(error)
                  })

                  proc.on('close', (code) => {
                    // request.signal.removeEventListener('abort', abortHandler)
                    if (code === 0) {
                      resolve(output)
                    } else {
                      // If killed by abort, don't log error
                      if (!request.signal.aborted) {
                        sendLog(`${stepName} exited with code ${code}`, code === 0 ? 'success' : 'warning')
                      }
                      resolve(output) 
                    }
                  })
                })
              }

              // Step 1: Discovery
              if (discovery) {
                sendLog('🔍 Step 1: Company Discovery', 'info')
                sendLog('Searching for new SaaS and tech companies...', 'info')
                const discoveryStart = Date.now()
                
                try {
                  const greenhouseOutput = await runCommand('npm', ['run', 'greenhouse:discover'], 'Greenhouse Discovery')
                  const leverOutput = await runCommand('npm', ['run', 'lever:discover'], 'Lever Discovery')
                  
                  // Parse discovery output
                  const ghStats = parseDiscoveryOutput(greenhouseOutput)
                  const leverStats = parseDiscoveryOutput(leverOutput)
                  
                  updateDiscoveryStats(syncReport, ghStats)
                  updateDiscoveryStats(syncReport, leverStats)
                  
                  const discoveryDuration = ((Date.now() - discoveryStart) / 1000).toFixed(1)
                  sendLog(`✅ Discovery completed in ${discoveryDuration}s`, 'success')
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`⚠️  Discovery had errors but continuing...`, 'warning')
                  }
                }
                sendLog('', 'info')
              }

              // Step 2: Cleanup
              if (cleanup) {
                sendLog('🧹 Step 2: Cleanup', 'info')
                sendLog('Running cleanup for selected sources...', 'info')
                const cleanupStart = Date.now()
                
                try {
                  const greenhouseOutput = await runCommand('npm', ['run', 'greenhouse:cleanup'], 'Greenhouse Cleanup')
                  const leverOutput = await runCommand('npm', ['run', 'lever:cleanup'], 'Lever Cleanup')
                  await runCommand('npm', ['run', 'remoteok:cleanup'], 'RemoteOK Cleanup')
                  await runCommand('npm', ['run', 'himalayas:cleanup'], 'Himalayas Cleanup')
                  
                  // Parse cleanup output for removed companies
                  const removedGreenhouse = (greenhouseOutput.match(/Removed.*?companies?/gi) || []).length
                  const removedLever = (leverOutput.match(/Removed.*?companies?/gi) || []).length
                  
                  if (removedGreenhouse > 0 || removedLever > 0) {
                    updateDiscoveryStats(syncReport, {
                      companiesRemoved: {
                        greenhouse: removedGreenhouse > 0 ? [`${removedGreenhouse} companies`] : [],
                        lever: removedLever > 0 ? [`${removedLever} companies`] : []
                      }
                    })
                  }
                  
                  const cleanupDuration = ((Date.now() - cleanupStart) / 1000).toFixed(1)
                  sendLog(`✅ Cleanup completed in ${cleanupDuration}s`, 'success')
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`⚠️  Cleanup had errors but continuing...`, 'warning')
                  }
                }
                sendLog('', 'info')
              }

              // Step 3: Maintenance (Cleanup Jobs)
              if (maintenance) {
                sendLog('🔧 Step 3: Maintenance', 'info')
                sendLog('Running job cleanup scripts...', 'info')
                const maintenanceStart = Date.now()
                
                try {
                  await runCommand('npm', ['run', 'cleanup-jobs'], 'Cleanup Jobs')
                  const maintenanceDuration = ((Date.now() - maintenanceStart) / 1000).toFixed(1)
                  sendLog(`✅ Maintenance completed in ${maintenanceDuration}s`, 'success')
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`⚠️  Maintenance had errors but continuing...`, 'warning')
                  }
                }
                sendLog('', 'info')
              }

              // Step 4: Sync
              if (updateExisting || addNew) {
                sendLog('📥 Step 4: Job Sync', 'info')
                sendLog('Fetching jobs from all sources...', 'info')
                const syncStart = Date.now()
                
                try {
                  const args = ['run', 'sync-jobs', '--']
                  if (!updateExisting) args.push('--no-update')
                  if (!addNew) args.push('--no-new')
                  
                  const jobOutput = await new Promise<string>((resolve, reject) => {
                    if (request.signal.aborted) {
                      reject(new Error('Aborted'))
                      return
                    }
                    let output = ''
                    const syncJobsProcess = spawn('npm', args, {
                      cwd: process.cwd(),
                      env: { ...process.env, UPDATE_EXISTING: updateExisting.toString(), ADD_NEW: addNew.toString(), SOURCES: sources?.join(',') || '' },
                      shell: true
                    })

                    syncJobsProcess.stdout?.on('data', (data) => {
                      const text = data.toString()
                      output += text
                      const lines = text.split('\n')
                      lines.forEach((line: string) => {
                        if (line.trim()) {
                          sendLog(line, 'info')
                        }
                      })
                    })

                    syncJobsProcess.stderr?.on('data', (data) => {
                      const text = data.toString()
                      output += text
                      const lines = text.split('\n')
                      lines.forEach((line: string) => {
                        if (line.trim()) {
                          sendLog(line, 'warning')
                        }
                      })
                    })

                    syncJobsProcess.on('error', (error) => {
                      sendLog(`Error in Job Sync: ${error.message}`, 'error')
                      reject(error)
                    })

                    syncJobsProcess.on('close', (code) => {
                      if (code === 0) {
                        resolve(output)
                      } else {
                        if (!request.signal.aborted) {
                          sendLog(`Job Sync exited with code ${code}`, code === 0 ? 'success' : 'warning')
                        }
                        resolve(output)
                      }
                    })
                  })
                  
                  // Parse job sync output
                  const jobStats = parseJobSyncOutput(jobOutput)
                  updateJobStats(syncReport, jobStats)
                  
                  const syncDuration = ((Date.now() - syncStart) / 1000).toFixed(1)
                  sendLog(`✅ Job sync completed in ${syncDuration}s`, 'success')
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`❌ Job sync failed`, 'error')
                  }
                  throw error
                }
              } else {
                sendLog('ℹ️  Job sync skipped (neither update nor new jobs selected)', 'info')
              }

              sendLog('', 'info')
              sendLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success')
              
              // Finalize and send report
              finalizeSyncReport(syncReport)
              const reportText = formatSyncReport(syncReport)
              sendLog(reportText, 'success')
              
              // Send report as separate event for UI display
              sendEvent({ 
                type: 'report', 
                report: syncReport 
              })
              
              completeSync(syncState.id)
              // Listener will handle sending complete event and closing controller

            } catch (error) {
              if (!request.signal.aborted) {
                sendLog('', 'error')
                sendLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'error')
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                completeSync(syncState.id, errorMessage)
              }
            } finally {
              // We don't close controller here because the listener handles it when 'complete' event fires
              // But if we aborted, we should close
              if (request.signal.aborted) {
                try {
                  controller.close()
                } catch (e) {}
              }
            }
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        })
      }
    }
  }
})
