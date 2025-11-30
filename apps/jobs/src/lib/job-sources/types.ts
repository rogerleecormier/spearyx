export interface RawJobListing {
  externalId: string
  title: string
  company?: string
  description: string
  location: string
  salary?: string
  postedDate: Date
  sourceUrl: string
  sourceName: string
  tags?: string[]
}

export interface JobSource {
  name: string
  fetch: (query?: string) => AsyncGenerator<RawJobListing[]>
}

export interface CategoryKeywords {
  id: number
  keywords: string[]
}
