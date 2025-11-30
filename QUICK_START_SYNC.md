# 🚀 Quick Start - Sync Now!

## Setup (One-time)

```bash
cd /home/rogerleecormier/Development/spearyx

# 1. Initialize database with categories
node seed-jobs-db-direct.js

# Output should show:
# ✅ Added: Programming & Development
# ✅ Added: Project Management
# ... (8 total)
# ✅ Database seeded! Total categories: 8

# 2. Verify setup works
node test-sync-local.js

# Output should show:
# ✅ Categories: 8
# ✅ Jobs: 0 (or higher if you synced before)
# ✅ Job inserted successfully
# ✅ All basic tests passed!
```

## Run Sync

### Terminal 1 - Start Server

**Option A: Jobs app only (recommended for sync testing)**
```bash
cd apps/jobs
npm run serve

# Wait for output like:
# ⛅️ wrangler dev
# Listening on http://localhost:8787
```

**Option B: All dev servers (if using monorepo)**
```bash
# Terminal 1: Run all dev servers
npx turbo run dev

# Terminal 2: Run jobs worker APIs (in another terminal)
cd apps/jobs && npm run serve
```

**For sync testing, use Option A** (simpler)

### Terminal 2 - Open Browser
```bash
# Open in your browser:
http://localhost:8787/sync
```

### In Browser - Select and Run

1. **Left Panel** - Select sources:
   - Check ✅ **RemoteOK** (fastest for testing)
   - Or check other sources: Greenhouse, Lever, Himalayas

2. **Run Selected Button** - Click to start

3. **Right Panel** - Watch logs stream in real-time:
   - 🚀 Starting job sync process
   - 📡 Fetching from RemoteOK
   - ✅ Added: [job title]
   - 📊 Sync Report with totals

## Expected Results

After RemoteOK sync completes (~30-60 seconds):
```
Step 4: Job Sync
  📥 Syncing jobs from configured sources...
    
  📡 Fetching from RemoteOK...
    Processing batch of 100 jobs from RemoteOK
    ✅ Added: Senior Developer (Category: Programming & Development)
    ✅ Added: Product Manager (Category: Project Management)
    ... (many more)
    
  ✅ Job sync completed in 35.2s
    Added: 87
    Updated: 0
    Skipped: 2

📊 Sync Report
  Sources: RemoteOK
  Jobs Added: 87
  Jobs Updated: 0
  Skipped: 2
  Duration: 35.2s
```

## Verify Jobs Were Stored

```bash
# Check database
cd /home/rogerleecormier/Development/spearyx
node test-sync-local.js

# Should now show something like:
# ✅ Jobs: 87
```

Or in browser, go to: `http://localhost:8787/`
- Should see jobs from RemoteOK displayed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No categories found" | Run: `node seed-jobs-db-direct.js` |
| "Stream error" | Check browser console (F12) for details, restart server |
| No jobs added | Check if external API accessible (RemoteOK, etc.) |
| Stuck at "Starting sync..." | Keep-alive messages sent every 15s, normal behavior |
| Jobs not appearing on home page | Refresh browser, check database with `test-sync-local.js` |

## Debug Info

### Check Server Logs
Watch the terminal running `npm run serve` for:
- `🔍 Sync-stream endpoint called` - Request received
- `✅ DB connection successful` - Database connected
- `📡 Fetching from RemoteOK...` - Starting fetch
- Job insertion logs with ✅ or ⚠️

### Check Browser Console
Press `F12` → Console tab:
- `✅ EventSource connection opened` - Stream connected
- `📨 Received message: {...}` - Log messages received
- Any `❌` errors indicate connection problems

### Check Database Directly
```bash
# Quick check
node test-sync-local.js

# Detailed check
node
> import Database from "better-sqlite3"
> const db = new Database("apps/jobs/.wrangler/state/v3/d1/.../620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite")
> db.prepare("SELECT COUNT(*) FROM jobs WHERE source_name = 'RemoteOK'").get()
# Shows: { count: <number> }
```

## What's Working

✅ Database initialization
✅ Job insertion
✅ Streaming to browser
✅ EventSource event handling
✅ Real-time log display
✅ Sync completion
✅ Report generation

## What's Next

After syncing:
1. Jobs appear on home page
2. Can filter by source, category, salary
3. Data persists in local D1 database
4. Ready to deploy to Cloudflare (same code works)
