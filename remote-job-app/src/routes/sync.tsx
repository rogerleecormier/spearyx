import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Play, Square, Loader2, ChevronDown, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/sync')({
  component: SyncPage
})

interface Script {
  id: string
  name: string
  description: string
  command: string
  category: string
}

interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

const SCRIPTS: Script[] = [
  // Company Discovery
  { id: 'gh-discover', name: 'Greenhouse Discovery', description: 'Discover new Greenhouse companies', command: 'greenhouse:discover', category: 'discovery' },
  { id: 'lever-discover', name: 'Lever Discovery', description: 'Discover new Lever companies', command: 'lever:discover', category: 'discovery' },
  
  // Company Cleanup
  { id: 'gh-cleanup', name: 'Greenhouse Cleanup', description: 'Remove 404 Greenhouse companies', command: 'greenhouse:cleanup', category: 'cleanup' },
  { id: 'lever-cleanup', name: 'Lever Cleanup', description: 'Remove 404 Lever companies', command: 'lever:cleanup', category: 'cleanup' },
  { id: 'remoteok-cleanup', name: 'RemoteOK Cleanup', description: 'Remove invalid RemoteOK jobs', command: 'remoteok:cleanup', category: 'cleanup' },
  { id: 'himalayas-cleanup', name: 'Himalayas Cleanup', description: 'Remove invalid Himalayas jobs', command: 'himalayas:cleanup', category: 'cleanup' },
  
  // Job Sources
  { id: 'source-remoteok', name: 'RemoteOK', description: 'Sync jobs from RemoteOK', command: 'sync-jobs', category: 'sources' },
  { id: 'source-greenhouse', name: 'Greenhouse', description: 'Sync jobs from Greenhouse', command: 'sync-jobs', category: 'sources' },
  { id: 'source-lever', name: 'Lever', description: 'Sync jobs from Lever', command: 'sync-jobs', category: 'sources' },
  { id: 'source-himalayas', name: 'Himalayas', description: 'Sync jobs from Himalayas', command: 'sync-jobs', category: 'sources' },
  
  // Maintenance
  { id: 'cleanup-jobs', name: 'Global Job Cleanup', description: 'Remove low-quality jobs (all sources)', command: 'cleanup-jobs', category: 'maintenance' },
]

const CATEGORIES = [
  { id: 'discovery', name: '📊 Company Discovery', icon: '📊' },
  { id: 'cleanup', name: '🧹 Company & Job Cleanup', icon: '🧹' },
  { id: 'sources', name: '💼 Job Sources', icon: '💼' },
  { id: 'maintenance', name: '🔧 Maintenance', icon: '🔧' },
]

function SyncPage() {
  const [selectedScripts, setSelectedScripts] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['discovery', 'sources']))
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [syncReport, setSyncReport] = useState<any>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const toggleScript = (scriptId: string) => {
    const newSelected = new Set(selectedScripts)
    if (newSelected.has(scriptId)) {
      newSelected.delete(scriptId)
    } else {
      newSelected.add(scriptId)
    }
    setSelectedScripts(newSelected)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const selectAll = () => {
    setSelectedScripts(new Set(SCRIPTS.map(s => s.id)))
  }

  const selectNone = () => {
    setSelectedScripts(new Set())
  }

  const selectPreset = (preset: string) => {
    const presets: Record<string, string[]> = {
      'quick': ['source-remoteok', 'source-himalayas'],
      'full': SCRIPTS.map(s => s.id),
      'discovery': SCRIPTS.filter(s => s.category === 'discovery').map(s => s.id),
      'cleanup': SCRIPTS.filter(s => s.category === 'cleanup').map(s => s.id),
    }
    setSelectedScripts(new Set(presets[preset] || []))

    // Update accordion state based on preset
    const newExpanded = new Set<string>()
    if (preset === 'cleanup') {
      newExpanded.add('cleanup')
    } else if (preset === 'discovery') {
      newExpanded.add('discovery')
    } else if (preset === 'quick') {
      newExpanded.add('sources')
    } else if (preset === 'full') {
      newExpanded.add('discovery')
      newExpanded.add('cleanup')
      newExpanded.add('sources')
      newExpanded.add('maintenance')
    }
    setExpandedCategories(newExpanded)
  }

  const runScripts = async () => {
    if (selectedScripts.size === 0) return
    
    setIsRunning(true)
    setLogs([])
    setSyncReport(null)

    // Determine which categories are active based on selected scripts
    const hasDiscovery = SCRIPTS.some(s => s.category === 'discovery' && selectedScripts.has(s.id))
    const hasCleanup = SCRIPTS.some(s => s.category === 'cleanup' && selectedScripts.has(s.id))
    const hasMaintenance = SCRIPTS.some(s => s.category === 'maintenance' && selectedScripts.has(s.id))
    const hasSources = SCRIPTS.some(s => s.category === 'sources' && selectedScripts.has(s.id))

    const params = new URLSearchParams()
    if (hasDiscovery) params.set('discovery', 'true')
    if (hasCleanup) params.set('cleanup', 'true')
    if (hasMaintenance) params.set('maintenance', 'true')
    
    // For sources, we currently treat updateExisting and addNew as true if any source is selected
    // This could be refined later to be more granular if needed
    if (hasSources) {
      params.set('updateExisting', 'true')
      params.set('addNew', 'true')
    }
    
    // Filter sources based on selection
    const selectedSources = SCRIPTS
      .filter(s => s.category === 'sources' && selectedScripts.has(s.id))
      .map(s => s.name)
    
    if (selectedSources.length > 0) {
      params.set('sources', selectedSources.join(','))
    }

    const url = `/api/sync-stream?${params.toString()}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'log') {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: data.level || 'info',
          message: data.message
        }])
      } else if (data.type === 'report') {
        setSyncReport(data.report)
      } else if (data.type === 'complete') {
        setIsRunning(false)
        eventSource.close()
      } else if (data.type === 'error') {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: data.message
        }])
        setIsRunning(false)
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: '❌ Connection lost'
      }])
      setIsRunning(false)
      eventSource.close()
    }
  }

  const stopSync = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsRunning(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Sync Dashboard
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Manage job discovery, cleanup, and synchronization
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Panel - Script Selection */}
        <div>
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={selectAll} style={buttonStyle}>Select All</button>
              <button onClick={selectNone} style={buttonStyle}>Select None</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                PRESETS
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => selectPreset('quick')} style={presetButtonStyle}>Quick Sync</button>
                <button onClick={() => selectPreset('full')} style={presetButtonStyle}>Full Sync</button>
                <button onClick={() => selectPreset('discovery')} style={presetButtonStyle}>Discovery Only</button>
                <button onClick={() => selectPreset('cleanup')} style={presetButtonStyle}>Cleanup Only</button>
              </div>
            </div>

            {CATEGORIES.map(category => {
              const categoryScripts = SCRIPTS.filter(s => s.category === category.id)
              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} style={{ marginBottom: '1rem' }}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {category.name}
                  </button>
                  
                  {isExpanded && (
                    <div style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                      {categoryScripts.map(script => (
                        <label
                          key={script.id}
                          style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={selectedScripts.has(script.id)}
                            onChange={() => toggleScript(script.id)}
                            style={{ marginTop: '0.25rem' }}
                          />
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{script.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{script.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={runScripts}
                disabled={isRunning || selectedScripts.size === 0}
                style={{
                  ...primaryButtonStyle,
                  opacity: (isRunning || selectedScripts.size === 0) ? 0.5 : 1,
                  cursor: (isRunning || selectedScripts.size === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Selected ({selectedScripts.size})
                  </>
                )}
              </button>
              
              {isRunning && (
                <button onClick={stopSync} style={dangerButtonStyle}>
                  <Square size={18} />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Output & Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Terminal Output */}
          <div style={{
            background: '#1e293b',
            borderRadius: '8px',
            padding: '1rem',
            minHeight: '400px',
            maxHeight: '600px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '1rem', fontWeight: '600' }}>
              📟 TERMINAL OUTPUT
            </div>
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                Ready to run scripts. Select scripts and click "Run Selected".
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    color: log.type === 'error' ? '#ef4444' :
                           log.type === 'success' ? '#10b981' :
                           log.type === 'warning' ? '#f59e0b' : '#e2e8f0',
                    marginBottom: '0.25rem'
                  }}
                >
                  <span style={{ color: '#64748b' }}>[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Sync Report */}
          {syncReport && (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                📊 Sync Report
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <StatCard label="Companies Tested" value={syncReport.discovery?.companiesTested || 0} />
                <StatCard label="Companies Discovered" value={syncReport.discovery?.companiesDiscovered || 0} color="#10b981" />
                <StatCard label="Jobs Fetched" value={syncReport.jobs?.totalFetched || 0} color="#3b82f6" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <StatCard label="Jobs Added" value={syncReport.jobs?.added || 0} color="#10b981" />
                <StatCard label="Jobs Updated" value={syncReport.jobs?.updated || 0} color="#f59e0b" />
                <StatCard label="Jobs Skipped" value={syncReport.jobs?.skipped || 0} color="#64748b" />
              </div>

              {syncReport.duration && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
                  ⏱️ Duration: {(syncReport.duration / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = '#1e293b' }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#f9fafb',
      borderRadius: '6px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{value.toLocaleString()}</div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.2s'
}

const presetButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#eff6ff',
  borderColor: '#3b82f6',
  color: '#1e40af'
}

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '600',
  transition: 'all 0.2s'
}

const dangerButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: '#ef4444',
  flex: 'none'
}
