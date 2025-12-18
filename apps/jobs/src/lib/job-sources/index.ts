import type { JobSource } from './types'
import { fetchRemoteOKJobs } from './remoteok'
import { fetchGreenhouseJobs } from './greenhouse'
import { fetchLeverJobs } from './lever'
import { fetchWorkableJobs } from './workable'
import { himalayasSource } from './himalayas'
import { jobicySource } from './jobicy'

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
  {
    name: 'Workable',
    fetch: fetchWorkableJobs
  },
  himalayasSource,
  jobicySource
]

export { fetchRemoteOKJobs } from './remoteok'
export { fetchGreenhouseJobs } from './greenhouse'
export { fetchLeverJobs } from './lever'
export { fetchWorkableJobs } from './workable'
export { himalayasSource } from './himalayas'
export { jobicySource } from './jobicy'
export { determineCategoryId } from './categorization'
export type { RawJobListing, JobSource } from './types'

