import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Play, Loader2, Search, Trash2, Copy } from 'lucide-react'
import { SyncConsole, type LogEntry } from '../components/SyncConsole'
import { SyncStats, type SyncStats as Stats } from '../components/SyncStats'

export const Route = createFileRoute('/sync')({
  component: SyncDashboard,
})

const JOB_SOURCES = [
  { id: 'RemoteOK', name: 'RemoteOK', description: 'Remote jobs from RemoteOK' },
  { id: 'Greenhouse', name: 'Greenhouse', description: 'Jobs from Greenhouse' },
  { id: 'Lever', name: 'Lever', description: 'Jobs from Lever' },
  { id: 'Himalayas', name: 'Himalayas', description: 'Jobs from Himalayas' },
]

function SyncDashboard() {
  // Sync state
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [isRunning, setIsRunning] = useState(false)
  const [syncId, setSyncId] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<Stats>({
    jobsAdded: 0,
    jobsUpdated: 0,
    jobsDeleted: 0,
    companiesAdded: 0,
    companiesDeleted: 0,
  })
  const [progress, setProgress] = useState(0)

  // Company search state
  const [searchSource, setSearchSource] = useState('Greenhouse')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Prune/Dedupe state
  const [isPruning, setIsPruning] = useState(false)
  const [isDeduping, setIsDeduping] = useState(false)

  const toggleSource = (sourceId: string) => {
    const newSelected = new Set(selectedSources)
    if (newSelected.has(sourceId)) {
      newSelected.delete(sourceId)
    } else {
      newSelected.add(sourceId)
    }
    setSelectedSources(newSelected)
  }

  const selectAllSources = () => {
    setSelectedSources(new Set(JOB_SOURCES.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedSources(new Set())
  }

  const startSync = async () => {
    try {
      setIsRunning(true)
      setLogs([])
      setStats({
        jobsAdded: 0,
        jobsUpdated: 0,
        jobsDeleted: 0,
        companiesAdded: 0,
        companiesDeleted: 0,
      })
      setProgress(0)

      let currentSyncId: string | null = null
      let totalAdded = 0
      let totalUpdated = 0
      let batchNumber = 0

      // Auto-chain API calls until all companies are processed
      while (true) {
        batchNumber++
        
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `🚀 Starting batch ${batchNumber}...`
        }])

        // Call sync API
        const response = await fetch('/api/v2/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncId: currentSyncId, // Pass syncId to continue existing sync
            sources: selectedSources.size > 0 ? Array.from(selectedSources) : undefined,
            updateExisting: true,
            addNew: true,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Sync failed')
        }

        // Update syncId for next iteration
        currentSyncId = data.syncId
        setSyncId(data.syncId)

        // Update progress
        if (data.progress) {
          setProgress(data.progress.percentage)
          
          setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: `✅ Batch ${batchNumber} complete: ${data.batch.companiesProcessed} companies processed (${data.progress.processed}/${data.progress.total} total)`
          }])

          setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            type: 'info',
            message: `   📊 Batch stats: +${data.batch.jobsAdded} added, ${data.batch.jobsUpdated} updated`
          }])
        }

        // Accumulate stats
        totalAdded += data.batch?.jobsAdded || 0
        totalUpdated += data.batch?.jobsUpdated || 0
        
        setStats({
          jobsAdded: totalAdded,
          jobsUpdated: totalUpdated,
          jobsDeleted: 0,
          companiesAdded: 0,
          companiesDeleted: 0,
        })

        // Check if we should continue
        if (!data.continue) {
          setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: `🎉 ${data.message}`
          }])
          
          setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: `📈 Total: ${totalAdded} jobs added, ${totalUpdated} jobs updated`
          }])
          break
        }

        // Wait 2 seconds between batches
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `⏳ Waiting 2 seconds before next batch...`
        }])
        
        await new Promise(r => setTimeout(r, 2000))
      }

      setIsRunning(false)
    } catch (error) {
      console.error('Sync error:', error)
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ])
      setIsRunning(false)
    }
  }

  const searchCompany = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResult(null)

    try {
      const response = await fetch('/api/v2/search-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: searchSource,
          query: searchQuery,
        }),
      })

      const data = await response.json()
      setSearchResult(data)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const pruneJobs = async (dryRun: boolean) => {
    setIsPruning(true)

    try {
      const response = await fetch('/api/v2/prune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun,
          sources: selectedSources.size > 0 ? Array.from(selectedSources) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add prune logs to console
        setLogs([...logs, ...data.logs])
      }
    } catch (error) {
      console.error('Prune error:', error)
    } finally {
      setIsPruning(false)
    }
  }

  const deduplicateJobs = async (dryRun: boolean) => {
    setIsDeduping(true)

    try {
      const response = await fetch('/api/v2/deduplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun,
          criteria: ['title', 'company'],
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add dedupe logs to console
        setLogs([...logs, ...data.logs])
      }
    } catch (error) {
      console.error('Dedupe error:', error)
    } finally {
      setIsDeduping(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sync Dashboard V2</h1>
          <p className="text-slate-600">
            Manage job synchronization, search companies, and maintain data quality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Source Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Sources</h2>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={selectAllSources}
                  className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  None
                </button>
              </div>

              <div className="space-y-2">
                {JOB_SOURCES.map(source => (
                  <label
                    key={source.id}
                    className="flex items-start gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.has(source.id)}
                      onChange={() => toggleSource(source.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{source.name}</div>
                      <div className="text-sm text-slate-500">{source.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={startSync}
                disabled={isRunning}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Sync...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Sync
                  </>
                )}
              </button>
            </div>

            {/* Company Search */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Search</h2>
              
              <select
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="w-full mb-3 px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="Greenhouse">Greenhouse</option>
                <option value="Lever">Lever</option>
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCompany()}
                placeholder="e.g., Netflix"
                className="w-full mb-3 px-3 py-2 border border-slate-300 rounded-lg"
              />

              <button
                onClick={searchCompany}
                disabled={isSearching || !searchQuery.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>

              {/* Search Result */}
              {searchResult && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                  {searchResult.found ? (
                    <div>
                      <div className="font-semibold text-green-700 mb-2">✓ Found!</div>
                      <div className="text-slate-700">
                        <div><strong>{searchResult.company.name}</strong></div>
                        <div className="text-xs text-slate-500 mt-1">
                          {searchResult.company.remoteJobCount} remote jobs
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ✗ {searchResult.error || 'Not found'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Maintenance Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Maintenance</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => pruneJobs(true)}
                  disabled={isPruning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  {isPruning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Pruning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Prune Jobs (Dry Run)
                    </>
                  )}
                </button>

                <button
                  onClick={() => deduplicateJobs(true)}
                  disabled={isDeduping}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
                >
                  {isDeduping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deduping...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Deduplicate (Dry Run)
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Dry run mode will show what would be changed without making actual changes.
              </p>
            </div>
          </div>

          {/* Right Column - Console & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <SyncStats stats={stats} progress={progress} isRunning={isRunning} />
            </div>

            {/* Console */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" style={{ height: '500px' }}>
              <SyncConsole 
                logs={logs} 
                isRunning={isRunning}
                onClear={() => setLogs([])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
