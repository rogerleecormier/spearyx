/**
 * V3 Sync Dashboard
 * Refactored with TanStack Query for smart caching
 * Shows worker status, sync logs with errors, and job stats
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Building2,
  Globe,
  Search,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react'

// ============================================
// Types
// ============================================

interface WorkerStatus {
  name: string
  icon: string
  sources: string[]
  schedule: string
  lastSync: string | null
  status: 'running' | 'completed' | 'failed' | 'never'
  error?: string
}

interface SourceStatus {
  lastSync: string | null
  status: 'running' | 'completed' | 'failed' | 'never'
  jobsAdded: number
  error?: string
}

interface DashboardStats {
  totalJobs: number
  totalDiscoveredCompanies: number
  pendingCompanies: number
  jobsBySource: {
    greenhouse: number
    lever: number
    workable: number
    remoteok: number
    himalayas: number
  }
  lastSyncAt: string | null
  sourceSyncStatus: Record<string, SourceStatus>
  workerStatus: Record<string, WorkerStatus>
}

interface SyncLog {
  id: string
  syncType: string
  source: string | null
  startedAt: string | null
  completedAt: string | null
  status: 'running' | 'completed' | 'failed'
  stats: {
    jobsAdded: number
    jobsUpdated: number
    jobsDeleted: number
    company?: string
    error?: string
  }
  logs: Array<{ timestamp: string; type: string; message: string }>
}

// ============================================
// Query Client (singleton for this route)
// ============================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,       // 5s before considered stale
      gcTime: 60000,         // 1 min cache
      refetchOnWindowFocus: true,
      retry: 2
    }
  }
})

// ============================================
// API Functions
// ============================================

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/v3/stats')
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.stats
}

async function fetchLogs(limit = 20): Promise<{ logs: SyncLog[]; meta: { recentErrors: number } }> {
  const res = await fetch(`/api/v3/logs?limit=${limit}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return { logs: data.logs, meta: data.meta }
}

async function triggerSync(worker: 'ats' | 'aggregator' | 'discovery'): Promise<any> {
  const res = await fetch(`/api/v3/sync/${worker}`, { method: 'POST' })
  return res.json()
}

// ============================================
// Dashboard Component
// ============================================

function SyncDashboardContent() {
  const queryClient = useQueryClient()
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Stats query
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['sync-stats'],
    queryFn: fetchStats,
    refetchInterval: autoRefresh ? 10000 : false  // 10s refresh
  })

  // Logs query
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: () => fetchLogs(30),
    refetchInterval: autoRefresh ? 10000 : false
  })

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] })
    }
  })

  // Helpers
  const formatTime = (iso: string | null) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ', ' + formatTime(iso)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      never: 'bg-slate-100 text-slate-600'
    }
    return styles[status] || styles.never
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading dashboard</p>
          <p className="text-sm">{String(statsError)}</p>
        </div>
      </div>
    )
  }

  const logs = logsData?.logs || []
  const recentErrors = logsData?.meta?.recentErrors || 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sync Dashboard</h1>
            <p className="text-slate-600 text-sm">V3 API • TanStack Query</p>
          </div>
          <div className="flex items-center gap-4">
            {recentErrors > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {recentErrors} errors (last hour)
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
                queryClient.invalidateQueries({ queryKey: ['sync-logs'] })
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Jobs" value={stats?.totalJobs || 0} />
          <StatCard label="Discovered Companies" value={stats?.totalDiscoveredCompanies || 0} />
          <StatCard label="Pending Discovery" value={stats?.pendingCompanies || 0} />
          <StatCard 
            label="Last Sync" 
            value={stats?.lastSyncAt ? formatDate(stats.lastSyncAt) : 'Never'} 
            isText 
          />
        </div>

        {/* Jobs by Source */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Jobs by Source</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SourceCard 
              source="greenhouse" 
              count={stats?.jobsBySource?.greenhouse || 0} 
              icon="🌱" 
              accentColor="border-l-green-500"
            />
            <SourceCard 
              source="lever" 
              count={stats?.jobsBySource?.lever || 0} 
              icon="⚙️"
              accentColor="border-l-blue-500"
            />
            <SourceCard 
              source="workable" 
              count={stats?.jobsBySource?.workable || 0} 
              icon="💼"
              accentColor="border-l-purple-500"
            />
            <SourceCard 
              source="remoteok" 
              count={stats?.jobsBySource?.remoteok || 0} 
              icon="🌐"
              accentColor="border-l-red-500"
            />
            <SourceCard 
              source="himalayas" 
              count={stats?.jobsBySource?.himalayas || 0} 
              icon="🏔️"
              accentColor="border-l-indigo-500"
            />
          </div>
        </div>

        {/* Worker Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Sync Workers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ordered: Discovery, ATS, Aggregator */}
            {['discovery', 'ats', 'aggregator'].map((id) => {
              const worker = stats?.workerStatus?.[id]
              if (!worker) return null
              return (
                <WorkerCard 
                  key={id}
                  workerId={id as 'ats' | 'aggregator' | 'discovery'}
                  worker={worker}
                  onTrigger={() => syncMutation.mutate(id as any)}
                  isTriggering={syncMutation.isPending}
                  formatDate={formatDate}
                />
              )
            })}
          </div>
        </div>

        {/* Recent Sync Logs */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Sync Runs</h2>
            <span className="text-xs text-slate-500">{logs.length} logs</span>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <LogEntry 
                key={log.id}
                log={log}
                isExpanded={expandedLog === log.id}
                onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                formatTime={formatTime}
              />
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No sync logs yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function StatCard({ label, value, isText = false }: { label: string; value: string | number; isText?: boolean }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`font-bold ${isText ? 'text-sm text-slate-700' : 'text-2xl text-slate-900'}`}>
        {value}
      </div>
    </div>
  )
}

function SourceCard({ 
  source, 
  count, 
  icon, 
  accentColor
}: { 
  source: string
  count: number
  icon: string
  gradient?: string
  bgLight?: string
  borderColor?: string
  accentColor: string
}) {
  return (
    <div className={`bg-white rounded-lg border border-l-4 ${accentColor} p-4`}>
      <div className="text-xs text-slate-500 mb-1 capitalize">{source}</div>
      <div className="text-2xl font-bold text-slate-900">
        {count.toLocaleString()}
      </div>
    </div>
  )
}

function WorkerCard({ 
  workerId, 
  worker, 
  onTrigger, 
  isTriggering,
  formatDate 
}: { 
  workerId: 'ats' | 'aggregator' | 'discovery'
  worker: WorkerStatus
  onTrigger: () => void
  isTriggering: boolean
  formatDate: (iso: string | null) => string
}) {
  const bgColors: Record<string, string> = {
    ats: 'bg-green-50 border-green-200',
    aggregator: 'bg-blue-50 border-blue-200',
    discovery: 'bg-purple-50 border-purple-200'
  }

  return (
    <div className={`rounded-lg border p-4 ${bgColors[workerId] || 'bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{worker.icon}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{worker.schedule}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            worker.status === 'running' ? 'bg-blue-100 text-blue-700' :
            worker.status === 'failed' ? 'bg-red-100 text-red-700' :
            worker.status === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {worker.status}
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900">{worker.name}</h3>
      <p className="text-xs text-slate-500 mt-1">{worker.sources.join(' • ')}</p>
      <p className="text-xs text-slate-500 mt-1">
        Last: {worker.lastSync ? formatDate(worker.lastSync) : 'Never'}
      </p>
      {worker.error && (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {worker.error}
        </p>
      )}
      <button
        onClick={onTrigger}
        disabled={isTriggering || worker.status === 'running'}
        className="mt-3 w-full px-3 py-1.5 text-xs bg-white border rounded hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <Play className="w-3 h-3" />
        Trigger Now
      </button>
    </div>
  )
}

function LogEntry({ 
  log, 
  isExpanded, 
  onToggle,
  formatTime 
}: { 
  log: SyncLog
  isExpanded: boolean
  onToggle: () => void
  formatTime: (iso: string | null) => string
}) {
  const getSourceIcon = (source: string | null) => {
    switch (source?.toLowerCase()) {
      case 'greenhouse': return <Building2 className="w-4 h-4 text-green-600" />
      case 'lever': return <Building2 className="w-4 h-4 text-blue-600" />
      case 'workable': return <Building2 className="w-4 h-4 text-purple-600" />
      case 'remoteok': return <Globe className="w-4 h-4 text-red-600" />
      case 'himalayas': return <Globe className="w-4 h-4 text-indigo-600" />
      default: return <Search className="w-4 h-4 text-purple-600" />
    }
  }

  const getSourceLabel = (log: SyncLog) => {
    if (log.syncType === 'discovery') return '🔍 Discovery'
    if (!log.source) return log.syncType
    const icons: Record<string, string> = {
      greenhouse: '🏢',
      lever: '🔧',
      workable: '💼',
      remoteok: '🌐',
      himalayas: '🏔️'
    }
    const icon = icons[log.source.toLowerCase()] || ''
    return `${icon} ${log.source}${log.stats.company ? ` / ${log.stats.company}` : ''}`
  }

  return (
    <div className={`${log.status === 'failed' ? 'bg-red-50' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {log.status === 'running' ? (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            ) : log.status === 'failed' ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <div>
              <div className="font-medium text-sm text-slate-900">
                {formatTime(log.startedAt)} - {getSourceLabel(log)}
              </div>
              <div className="text-xs text-slate-500">
                {log.status === 'failed' && log.stats.error ? (
                  <span className="text-red-600">{log.stats.error}</span>
                ) : log.syncType === 'discovery' ? (
                  `Checked ${(log.stats as any).companiesChecked || 0}: ${(log.stats as any).companiesAdded || 0} new, ${(log.stats as any).companiesUpdated || 0} updated`
                ) : (
                  `+${log.stats.jobsAdded} added, ${log.stats.jobsUpdated} updated`
                )}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      
      {isExpanded && log.logs.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto">
            {[...log.logs].reverse().map((entry, i) => (
              <div key={i} className={`${
                entry.type === 'error' ? 'text-red-400' :
                entry.type === 'warning' ? 'text-yellow-400' :
                entry.type === 'success' ? 'text-green-400' :
                'text-slate-300'
              }`}>
                [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Route Export with QueryClientProvider
// ============================================

export const Route = createFileRoute('/sync')({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <SyncDashboardContent />
    </QueryClientProvider>
  )
})
