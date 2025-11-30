# Local Database Sync - Setup & Debugging Guide

## Current Status

✅ **Database Initialized**
- Local D1 database created and migrations applied
- 8 job categories seeded
- Database path: `apps/jobs/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite`

## How to Use

### 1. Verify Setup
```bash
# Test database and basic insertion
node test-sync-local.js
```

Expected output:
```
✅ Categories: 8
✅ Jobs: 0
✅ Job inserted successfully
```

### 2. Start Development Server
```bash
cd apps/jobs
npm run serve
```

Server will start on: `http://localhost:8787`

### 3. Test Sync Page
Open: `http://localhost:8787/sync`

**To run a sync:**
1. **Select sources** from the left panel (RemoteOK, Greenhouse, Lever, Himalayas)
2. **Click "Run Selected"** button
3. **Monitor the terminal output** for logs

## Job Sources

### RemoteOK
- **API**: `https://remoteok.com/api`
- **Status**: Fully working
- **Jobs**: Remote jobs across all industries
- **Rate Limit**: None known

### Greenhouse
- **API**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true`
- **Status**: Fully working
- **Jobs**: Tech company remote positions
- **Rate Limit**: Respectful (500ms between requests)

### Lever
- **API**: `https://api.lever.co/v0/postings/{company}?mode=json`
- **Status**: Fully working
- **Jobs**: Tech company remote positions
- **Rate Limit**: Respectful (500ms between requests)

### Himalayas
- **API**: `https://himalayas.app/jobs/api?limit=20&offset=0`
- **Status**: Fully working
- **Jobs**: Remote jobs with location restrictions
- **Rate Limit**: 2 seconds between requests

## Troubleshooting

### Issue: "Stream error" on sync page

**Causes:**
1. Database categories not seeded
   - Fix: `node seed-jobs-db-direct.js`

2. Database insert errors
   - Check browser console for details
   - Verify categories exist: `node test-sync-local.js`

3. EventSource connection issue
   - Check network tab in browser dev tools
   - Server should return `text/event-stream` content type
   - Look for `data: {...}` formatted messages

### Issue: No jobs being inserted

**Causes:**
1. Job sources are returning empty results
   - Check if external APIs are accessible
   - Verify network connectivity

2. Categorization failing
   - Jobs will default to category ID 1 if categorization fails
   - Check that category IDs 1-8 exist in database

3. Duplicate prevention
   - Jobs with same `sourceUrl` won't be inserted twice
   - This is intentional to prevent duplicates

### Issue: Page freezes during sync

**Causes:**
1. Large batch of jobs being processed
   - RemoteOK can return 100+ jobs
   - Processing is done in batches server-side

2. Keep-alive timeout
   - EventSource sends keep-alive messages every 15 seconds
   - If you see 15 second gaps between logs, connection is still alive

## Key Files

- **Sync Streaming**: `apps/jobs/src/routes/api/sync-stream.ts`
- **Job Sync Logic**: `apps/jobs/src/lib/job-sync.ts`
- **Job Sources**:
  - `apps/jobs/src/lib/job-sources/remoteok.ts`
  - `apps/jobs/src/lib/job-sources/greenhouse.ts`
  - `apps/jobs/src/lib/job-sources/lever.ts`
  - `apps/jobs/src/lib/job-sources/himalayas.ts`
- **Sync UI**: `apps/jobs/src/routes/sync.tsx`
- **Database Schema**: `apps/jobs/src/db/schema.ts`
- **Migrations**: `apps/jobs/drizzle/*.sql`

## Testing Flow

```
1. Database initialized ✅
   ↓
2. Dev server starts
   ↓
3. Open /sync page
   ↓
4. Select "RemoteOK" source
   ↓
5. Click "Run Selected"
   ↓
6. Monitor browser console for EventSource messages
   ↓
7. Check "Added", "Updated", "Skipped" counts
   ↓
8. Verify jobs appear in database
```

## Remote Database (Future)

For remote D1 database operations:
```bash
# Migrate to remote
npm run db:migrate:prod

# Seed remote
wrangler d1 execute DB --remote < seed-script.sql
```
