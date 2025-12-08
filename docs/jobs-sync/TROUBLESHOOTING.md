# V3 Sync Troubleshooting Guide

Quick reference for common issues and solutions.

---

## Worker Issues

### Worker Stuck on Same Company

**Symptom:** ATS sync keeps processing the same company repeatedly.

**Cause:** Batch state not advancing due to uncaught error.

**Solution:**
1. Check Cloudflare logs for error details
2. Verify content-type checking is in place
3. Manually advance batch state:
```sql
UPDATE sync_history 
SET stats = json_set(stats, '$.atsIndex', 5)
WHERE status = 'batch_state' AND sync_type = 'ats';
```

### JSON Parse Error ("Unexpected token '<'")

**Symptom:** `SyntaxError: Unexpected token '<', "<!DOCTYPE"...`

**Cause:** API returned HTML instead of JSON (404 page, error page, etc.)

**Solution:**
- Content-type checking should skip these automatically
- If persists, check the company's job board URL manually
- Remove invalid company from source list

### Workers Running at Same Time

**Symptom:** Log entries from multiple workers appearing together.

**Solution:** Verify staggered cron schedules:
- Discovery: `:00, :03, :06...`
- ATS: `:01, :04, :07...`
- Aggregator: `:02, :05, :08...`

---

## Database Issues

### Jobs Not Appearing on Frontend

**Causes:**
1. Jobs synced but no remote jobs match
2. Category ID mismatch
3. API endpoint returning empty

**Debug:**
```sql
-- Check total jobs
SELECT COUNT(*) FROM jobs;

-- Check recent jobs
SELECT id, title, company, source_name, created_at 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check jobs by source
SELECT source_name, COUNT(*) as count 
FROM jobs 
GROUP BY source_name;
```

### Sync History Filling Up

**Solution:** Periodically clean old sync records:
```sql
DELETE FROM sync_history 
WHERE status != 'batch_state' 
AND completed_at < datetime('now', '-7 days');
```

---

## API Issues

### RemoteOK Returns Same 98 Jobs

**This is expected.** RemoteOK's public API only returns ~98 jobs.

**Mitigation:** Tag cycling queries different job subsets:
- `/api?tag=dev` → ~100 different jobs
- `/api?tag=design` → ~99 different jobs
- etc.

### Greenhouse/Lever 404 Errors

**Cause:** Company doesn't have public job board at expected URL.

**Solution:**
1. Verify company name matches their board token
2. Check if using custom domain
3. Remove from source list if invalid

---

## Performance Issues

### Sync Taking Too Long

**Check:**
1. Number of jobs per company
2. Network latency to external APIs
3. D1 query performance

**Optimize:**
- Limit jobs per sync to 100
- Use batch inserts where possible
- Consider parallel processing (carefully with rate limits)

### Worker CPU Time Exceeded

**Cause:** Processing too many jobs in one execution.

**Solution:**
- Reduce batch size
- Split large syncs across multiple runs
- Use lazy cleansing (don't sanitize during sync)

---

## Quick Commands

### Check Batch State
```sql
SELECT * FROM sync_history 
WHERE status = 'batch_state';
```

### Reset ATS Index
```sql
UPDATE sync_history 
SET stats = '{"atsIndex": 0, "lastSource": "lever"}'
WHERE status = 'batch_state' AND sync_type = 'ats';
```

### Reset Aggregator Tag Index
```sql
UPDATE sync_history 
SET stats = '{"lastSource": "himalayas", "remoteokTagIndex": 0}'
WHERE status = 'batch_state' AND sync_type = 'aggregator';
```

### Manual Sync Trigger
```bash
curl -X POST https://jobs.spearyx.com/api/v3/sync/ats
curl -X POST https://jobs.spearyx.com/api/v3/sync/aggregator
curl -X POST https://jobs.spearyx.com/api/v3/sync/discovery
```

### View Recent Logs
```sql
SELECT id, source, status, stats, 
       datetime(started_at, 'unixepoch') as started
FROM sync_history 
WHERE status != 'batch_state'
ORDER BY started_at DESC 
LIMIT 20;
```
