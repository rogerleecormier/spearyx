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

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
