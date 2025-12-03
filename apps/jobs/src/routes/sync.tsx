import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, CheckCircle, Clock, Database, Briefcase, Building2 } from 'lucide-react'

export const Route = createFileRoute('/sync')({
  component: SyncDashboard,
})

interface DashboardStats {
  totalDiscoveredCompanies: number
  totalJobs: number
  pendingCompanies: number
  lastSyncAt: string | null
}

interface SyncLog {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

interface SyncRun {
  id: string
  startedAt: string | null
  completedAt: string | null
  status: string
  stats: {
    jobsAdded: number
    jobsUpdated: number
    jobsDeleted: number
    companiesAdded: number
    companiesDeleted: number
  }
  logs: SyncLog[]
  totalCompanies: number
  processedCompanies: number
}

function SyncDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedRun, setSelectedRun] = useState<string | null>(null)

  const fetchData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setIsRefreshing(true)
    }

    try {
      // Fetch stats
      const statsResponse = await fetch('/api/v2/stats')
      const statsData = await statsResponse.json() as { success: boolean; stats: DashboardStats }
      if (statsData.success) {
        setStats(statsData.stats)
      }

      // Fetch sync logs
      const logsResponse = await fetch('/api/v2/sync-logs')
      const logsData = await logsResponse.json() as { success: boolean; syncs: SyncRun[] }
      if (logsData.success) {
        setSyncRuns(logsData.syncs)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      case 'running':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      case 'success':
        return 'text-green-600'
      default:
        return 'text-slate-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const selectedRunData = syncRuns.find(run => run.id === selectedRun)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sync Dashboard</h1>
            <p className="text-slate-600">
              Automated job sync runs every 5 minutes, processing 10 companies per batch
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={() => fetchData()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Discovered Companies</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.totalDiscoveredCompanies || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Companies we're tracking jobs from</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Jobs</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.totalJobs || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Jobs found across all companies</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Pending Discovery</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.pendingCompanies || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Companies not yet discovered</p>
          </div>
        </div>

        {/* Last Sync Info */}
        {stats?.lastSyncAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Last sync completed:</strong> {formatDate(stats.lastSyncAt)}
            </p>
          </div>
        )}

        {/* Sync Runs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Sync Runs</h2>
            <p className="text-sm text-slate-600 mt-1">Last 20 automated sync runs</p>
          </div>

          <div className="divide-y divide-slate-200">
            {syncRuns.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No sync runs yet. Waiting for first automated sync...</p>
              </div>
            ) : (
              syncRuns.map((run) => (
                <div key={run.id}>
                  <button
                    onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                    className={`w-full p-4 hover:bg-slate-50 transition-colors text-left ${getStatusColor(run.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(run.status)}
                        <div>
                          <div className="font-medium text-slate-900">
                            {formatTime(run.startedAt)} - {run.status === 'completed' ? 'Completed' : run.status === 'failed' ? 'Failed' : 'Running'}
                          </div>
                          <div className="text-sm text-slate-600">
                            {run.processedCompanies} companies processed
                            {run.stats.jobsAdded > 0 && ` • +${run.stats.jobsAdded} jobs added`}
                            {run.stats.jobsUpdated > 0 && ` • ${run.stats.jobsUpdated} updated`}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {run.completedAt && formatDate(run.completedAt)}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Log Details */}
                  {selectedRun === run.id && selectedRunData && (
                    <div className="bg-slate-900 p-4 font-mono text-sm">
                      {selectedRunData.logs.length === 0 ? (
                        <p className="text-slate-400">No logs available</p>
                      ) : (
                        <div className="space-y-1">
                          {selectedRunData.logs.map((log, idx) => (
                            <div key={idx} className={getLogTypeColor(log.type)}>
                              <span className="text-slate-500">[{formatTime(log.timestamp)}]</span>{' '}
                              {log.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
