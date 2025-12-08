import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  company: text('company'),
  description: text('description'),
  descriptionRaw: text('description_raw'), // Raw/dirty data from source
  fullDescription: text('full_description'),
  isCleansed: integer('is_cleansed').default(0), // 0 = needs cleansing, 1 = cleansed
  payRange: text('pay_range'),
  postDate: integer('post_date', { mode: 'timestamp' }),
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name').notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  remoteType: text('remote_type').notNull().default('fully_remote'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})


export const discoveredCompanies = sqliteTable('discovered_companies', {
  slug: text('slug').primaryKey(),
  name: text('name'),
  jobCount: integer('job_count').default(0),
  remoteJobCount: integer('remote_job_count').default(0),
  departments: text('departments', { mode: 'json' }).$type<string[]>(),
  suggestedCategory: text('suggested_category'),
  sampleJobs: text('sample_jobs', { mode: 'json' }).$type<string[]>(),
  source: text('source').notNull(), // 'greenhouse', 'lever', etc.
  status: text('status').default('new'), // 'new', 'added', 'ignored'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const syncHistory = sqliteTable('sync_history', {
  id: text('id').primaryKey(),
  syncType: text('sync_type').notNull().default('job_sync'), // 'job_sync' or 'discovery'
  source: text('source'), // 'greenhouse', 'lever', 'remoteok', 'himalayas' for micro-cron tracking
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status').notNull().default('running'), // 'queued', 'running', 'processing', 'completed', 'failed', 'batch_state'
  sources: text('sources', { mode: 'json' }).$type<string[]>(),
  totalCompanies: integer('total_companies').default(0),
  processedCompanies: integer('processed_companies').default(0),
  lastProcessedIndex: integer('last_processed_index').default(0),
  failedCompanies: text('failed_companies', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  stats: text('stats', { mode: 'json' }).$type<{
    jobsAdded: number
    jobsUpdated: number
    jobsDeleted: number
    companiesAdded: number
    companiesDeleted: number
  }>(),
  logs: text('logs', { mode: 'json' }).$type<Array<{
    timestamp: string
    type: 'info' | 'success' | 'error' | 'warning'
    message: string
  }>>(),
})

// Potential companies to discover
export const potentialCompanies = sqliteTable('potential_companies', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  addedAt: integer('added_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  lastCheckedAt: integer('last_checked_at', { mode: 'timestamp' }),
  checkCount: integer('check_count').default(0),
  status: text('status').default('pending'), // 'pending', 'checking', 'not_found', 'discovered'
})

// Discovery state for rotation
export const discoveryState = sqliteTable('discovery_state', {
  id: text('id').primaryKey(),
  lastProcessedIndex: integer('last_processed_index').default(0),
  totalPotential: integer('total_potential').default(0),
  status: text('status').default('active'),
})

// Track job-level progress per company to handle pagination
export const companyJobProgress = sqliteTable('company_job_progress', {
  companySlug: text('company_slug').primaryKey(),
  source: text('source').notNull(), // 'greenhouse', 'lever', etc.
  lastJobOffset: integer('last_job_offset').default(0),
  totalJobsDiscovered: integer('total_jobs_discovered').default(0),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const duplicateJobs = sqliteTable('duplicate_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobId1: integer('job_id_1').notNull().references(() => jobs.id),
  jobId2: integer('job_id_2').notNull().references(() => jobs.id),
  similarityScore: integer('similarity_score').notNull(), // 0-100
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
export type SyncHistory = typeof syncHistory.$inferSelect
export type NewSyncHistory = typeof syncHistory.$inferInsert
export type DuplicateJob = typeof duplicateJobs.$inferSelect
export type NewDuplicateJob = typeof duplicateJobs.$inferInsert
export type CompanyJobProgress = typeof companyJobProgress.$inferSelect
export type NewCompanyJobProgress = typeof companyJobProgress.$inferInsert
