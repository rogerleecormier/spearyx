// In-memory state management for ongoing sync operations
// This allows sync to continue in the background even if the modal is closed

import type { SyncReport } from './sync-report'

export interface SyncState {
  id: string
  status: 'running' | 'complete' | 'error'
  startTime: number
  endTime?: number
  logs: Array<{
    timestamp: string
    type: 'info' | 'success' | 'error' | 'warning'
    message: string
  }>
  error?: string
  includeCleanup: boolean
  report?: SyncReport
}

// Store active and recent syncs (keep last 5 completed syncs for 1 hour)
const activeSyncs = new Map<string, SyncState>()
const SYNC_RETENTION_MS = 60 * 60 * 1000 // 1 hour

// Event listeners for sync updates
type SyncListener = (event: any) => void
const listeners = new Map<string, Set<SyncListener>>()

let syncCounter = 0

export function createSync(includeCleanup: boolean = false): SyncState {
  const id = `sync-${Date.now()}-${++syncCounter}`
  const state: SyncState = {
    id,
    status: 'running',
    startTime: Date.now(),
    logs: [],
    includeCleanup
  }
  activeSyncs.set(id, state)
  return state
}

export function getSync(id: string): SyncState | undefined {
  return activeSyncs.get(id)
}

export function subscribeToSync(id: string, callback: SyncListener) {
  if (!listeners.has(id)) {
    listeners.set(id, new Set())
  }
  listeners.get(id)!.add(callback)
}

export function unsubscribeFromSync(id: string, callback: SyncListener) {
  const syncListeners = listeners.get(id)
  if (syncListeners) {
    syncListeners.delete(callback)
    if (syncListeners.size === 0) {
      listeners.delete(id)
    }
  }
}

function notifyListeners(id: string, event: any) {
  const syncListeners = listeners.get(id)
  if (syncListeners) {
    syncListeners.forEach(callback => callback(event))
  }
}

export function addSyncLog(
  id: string,
  message: string,
  type: 'info' | 'success' | 'error' | 'warning' = 'info'
) {
  const state = activeSyncs.get(id)
  if (state) {
    state.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    })
    
    notifyListeners(id, { type: 'log', message, level: type })
  }
}

export function completeSync(id: string, error?: string) {
  const state = activeSyncs.get(id)
  if (state) {
    state.status = error ? 'error' : 'complete'
    state.endTime = Date.now()
    if (error) {
      state.error = error
      notifyListeners(id, { type: 'error', message: error })
    } else {
      const duration = state.endTime - state.startTime
      notifyListeners(id, { type: 'complete', duration })
    }
    
    // Clean up old syncs after retention period
    setTimeout(() => {
      activeSyncs.delete(id)
    }, SYNC_RETENTION_MS)
  }
}

export function getActiveSyncId(): string | undefined {
  for (const [id, state] of activeSyncs.entries()) {
    if (state.status === 'running') {
      return id
    }
  }
  return undefined
}

export function getAllActiveSyncs(): SyncState[] {
  return Array.from(activeSyncs.values()).filter(s => s.status === 'running')
}
