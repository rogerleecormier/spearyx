import { throttle } from '@tanstack/pacer'

/**
 * Configuration for throttled API fetching
 */
export interface ThrottledFetcherConfig {
  /** Time to wait between executions in milliseconds */
  wait: number
  /** Execute on the leading edge of the timeout */
  leading?: boolean
  /** Execute on the trailing edge of the timeout */
  trailing?: boolean
  /** Maximum number of retries on failure */
  maxRetries?: number
  /** Base delay for exponential backoff in milliseconds */
  retryDelay?: number
}

/**
 * Configuration for batched database operations
 */
export interface BatchedDbWriterConfig<T> {
  /** Maximum number of items in a batch before flushing */
  maxSize: number
  /** Maximum time to wait before flushing a batch in milliseconds */
  wait: number
  /** Function to execute the batch write */
  writeFn: (items: T[]) => Promise<void>
  /** Optional callback for batch completion */
  onBatchComplete?: (items: T[], success: boolean) => void
  /** Optional callback for errors */
  onError?: (error: Error, items: T[]) => void
}

/**
 * Configuration for rate limiting
 */
export interface RateLimiterConfig {
  /** Maximum number of requests allowed */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Use sliding window (true) or fixed window (false) */
  sliding?: boolean
}

/**
 * Creates a throttled fetch function that limits the rate of API calls
 * 
 * @example
 * const throttledFetch = createThrottledFetcher({
 *   wait: 500,
 *   trailing: true,
 *   maxRetries: 3
 * })
 * 
 * const data = await throttledFetch('https://api.example.com/data')
 */
export function createThrottledFetcher(config: ThrottledFetcherConfig) {
  const {
    wait,
    leading = false,
    trailing = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = config

  // Create the base fetch function
  const baseFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options)
        
        // If we get a rate limit error, throw to trigger retry
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt)
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
        
        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError || new Error('Fetch failed after retries')
  }

  // Create throttled version
  const throttledFetch = throttle(baseFetch, { wait, leading, trailing })

  return throttledFetch
}

/**
 * Creates a batched database writer that accumulates items and writes them in batches
 * 
 * @example
 * const batchWriter = createBatchedDbWriter({
 *   maxSize: 50,
 *   wait: 2000,
 *   writeFn: async (jobs) => {
 *     await db.insert(schema.jobs).values(jobs)
 *   },
 *   onBatchComplete: (items, success) => {
 *     console.log(`Batch of ${items.length} items ${success ? 'succeeded' : 'failed'}`)
 *   }
 * })
 * 
 * // Add items to batch
 * await batchWriter.add(job1)
 * await batchWriter.add(job2)
 * 
 * // Flush remaining items
 * await batchWriter.flush()
 */
export function createBatchedDbWriter<T>(config: BatchedDbWriterConfig<T>) {
  const { maxSize, wait, writeFn, onBatchComplete, onError } = config
  
  let currentBatch: T[] = []
  let flushTimer: NodeJS.Timeout | null = null
  let isProcessing = false
  
  const processBatch = async (items: T[]) => {
    if (items.length === 0) return
    
    isProcessing = true
    
    try {
      await writeFn(items)
      onBatchComplete?.(items, true)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err, items)
      onBatchComplete?.(items, false)
      throw err
    } finally {
      isProcessing = false
    }
  }
  
  const scheduleFlush = () => {
    if (flushTimer) {
      clearTimeout(flushTimer)
    }
    
    flushTimer = setTimeout(async () => {
      if (currentBatch.length > 0) {
        const batchToProcess = [...currentBatch]
        currentBatch = []
        await processBatch(batchToProcess)
      }
    }, wait)
  }
  
  return {
    /**
     * Add an item to the batch. Will trigger flush if maxSize is reached.
     */
    add: async (item: T) => {
      currentBatch.push(item)
      
      if (currentBatch.length >= maxSize) {
        if (flushTimer) {
          clearTimeout(flushTimer)
          flushTimer = null
        }
        
        const batchToProcess = [...currentBatch]
        currentBatch = []
        await processBatch(batchToProcess)
      } else {
        scheduleFlush()
      }
    },
    
    /**
     * Manually flush all pending items in the batch
     */
    flush: async () => {
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushTimer = null
      }
      
      if (currentBatch.length > 0) {
        const batchToProcess = [...currentBatch]
        currentBatch = []
        await processBatch(batchToProcess)
      }
    },
    
    /**
     * Get the current batch size
     */
    size: () => currentBatch.length,
    
    /**
     * Check if a batch is currently being processed
     */
    isProcessing: () => isProcessing,
  }
}

/**
 * Creates a rate limiter using a sliding window algorithm
 * 
 * @example
 * const rateLimiter = createRateLimiter({
 *   maxRequests: 120,
 *   windowMs: 60000, // 1 minute
 *   sliding: true
 * })
 * 
 * // Check if request is allowed
 * if (await rateLimiter.checkLimit()) {
 *   await makeApiCall()
 * } else {
 *   console.log('Rate limit exceeded')
 * }
 */
export function createRateLimiter(config: RateLimiterConfig) {
  const { maxRequests, windowMs, sliding = true } = config
  
  const requests: number[] = []
  
  const cleanOldRequests = (now: number) => {
    const cutoff = now - windowMs
    while (requests.length > 0 && requests[0] < cutoff) {
      requests.shift()
    }
  }
  
  return {
    /**
     * Check if a request is allowed under the rate limit.
     * Returns true if allowed, false if rate limit exceeded.
     */
    checkLimit: async (): Promise<boolean> => {
      const now = Date.now()
      
      if (sliding) {
        cleanOldRequests(now)
      } else {
        // Fixed window - reset if window has passed
        if (requests.length > 0 && now - requests[0] >= windowMs) {
          requests.length = 0
        }
      }
      
      if (requests.length < maxRequests) {
        requests.push(now)
        return true
      }
      
      return false
    },
    
    /**
     * Wait until a request is allowed, respecting the rate limit
     */
    waitForSlot: async function(this: any): Promise<void> {
      while (!(await this.checkLimit())) {
        // Calculate how long to wait
        const now = Date.now()
        const oldestRequest = requests[0]
        const waitTime = Math.max(0, windowMs - (now - oldestRequest)) + 100 // Add 100ms buffer
        
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    },
    
    /**
     * Get current request count in the window
     */
    getCurrentCount: (): number => {
      const now = Date.now()
      cleanOldRequests(now)
      return requests.length
    },
    
    /**
     * Reset the rate limiter
     */
    reset: () => {
      requests.length = 0
    },
  }
}

/**
 * Utility to create a combined throttled + rate-limited fetcher
 * 
 * @example
 * const fetcher = createThrottledRateLimitedFetcher({
 *   throttle: { wait: 500, trailing: true },
 *   rateLimit: { maxRequests: 120, windowMs: 60000 }
 * })
 * 
 * const response = await fetcher('https://api.example.com/data')
 */
export function createThrottledRateLimitedFetcher(config: {
  throttle: ThrottledFetcherConfig
  rateLimit: RateLimiterConfig
}) {
  const throttledFetch = createThrottledFetcher(config.throttle)
  const rateLimiter = createRateLimiter(config.rateLimit)
  
  return async (url: string, options?: RequestInit): Promise<Response> => {
    // Wait for rate limit slot
    await rateLimiter.waitForSlot()
    
    // Execute throttled fetch - with trailing:true, this will always execute and return a Promise<Response>
    return (await throttledFetch(url, options)) as unknown as Response
  }
}

