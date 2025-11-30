import type { JobSource } from './types'
import { fetchRemoteOKJobs } from './remoteok'
import { fetchGreenhouseJobs } from './greenhouse'
import { fetchLeverJobs } from './lever'
import { himalayasSource } from './himalayas'

export const jobSources: JobSource[] = [
  {
    name: 'RemoteOK',
    fetch: fetchRemoteOKJobs
  },
  {
    name: 'Greenhouse',
    fetch: fetchGreenhouseJobs
  },
  {
    name: 'Lever',
    fetch: fetchLeverJobs
  },
  himalayasSource
]

export { fetchRemoteOKJobs } from './remoteok'
export { fetchGreenhouseJobs } from './greenhouse'
export { fetchLeverJobs } from './lever'
export { himalayasSource } from './himalayas'
export { determineCategoryId } from './categorization'
export type { RawJobListing, JobSource } from './types'
