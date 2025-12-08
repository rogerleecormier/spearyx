# Adding New Job Sources

Guide for adding new ATS platforms or job aggregators to the V3 sync system.

---

## Adding a New ATS Source (e.g., Workday, Ashby)

### 1. Create Throttled Fetcher

Edit `src/lib/sync-queue.ts`:

```typescript
export const sourceFetchers = {
  greenhouse: createSourceFetcher('greenhouse', 1000),
  lever: createSourceFetcher('lever', 1000),
  remoteok: createSourceFetcher('remoteok', 2000),
  himalayas: createSourceFetcher('himalayas', 2000),
  // Add new source
  workday: createSourceFetcher('workday', 1000),
}
```

### 2. Create Company List

Create `src/lib/job-sources/workday-companies.json`:

```json
{
  "categories": {
    "tech": {
      "companies": ["company1", "company2"]
    }
  }
}
```

### 3. Update ATS Sync Endpoint

Edit `src/routes/api/v3/sync/ats.ts`:

```typescript
// Import new companies
import workdayCompanies from '../../../../lib/job-sources/workday-companies.json'

function getWorkdayCompanies(): string[] {
  // Similar to getGreenhouseCompanies()
}

// Update source rotation to include workday
// Add API URL logic
// Add job parsing logic
```

### 4. Update Types

Edit `src/lib/sync-queue.ts`:

```typescript
export interface SyncWorkItem {
  source: 'greenhouse' | 'lever' | 'remoteok' | 'himalayas' | 'workday'
  // ...
}
```

---

## Adding a New Aggregator Source

### 1. Update Aggregator Endpoint

Edit `src/routes/api/v3/sync/aggregator.ts`:

```typescript
// Add to source rotation
export function getNextAggregatorSource(lastSource: string): string {
  const sources = ['remoteok', 'himalayas', 'newsite']
  const currentIndex = sources.indexOf(lastSource)
  return sources[(currentIndex + 1) % sources.length]
}

// Add API handling
if (source === 'newsite') {
  apiUrl = 'https://newsite.com/api/jobs'
  // Parse response format
}
```

### 2. Add Throttled Fetcher

```typescript
export const sourceFetchers = {
  // ...existing
  newsite: createSourceFetcher('newsite', 2000),
}
```

---

## Testing New Sources

### 1. Test API Response

```bash
curl -s 'https://api.newsource.com/jobs' | jq '.' | head -50
```

### 2. Check Rate Limits

Review API documentation for:
- Requests per minute/second
- Authentication requirements
- Response pagination

### 3. Manual Trigger Test

```bash
curl -X POST https://jobs.spearyx.com/api/v3/sync/[endpoint]
```

### 4. Verify in Database

```sql
SELECT * FROM jobs 
WHERE source_name = 'NewSource' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Checklist

- [ ] Throttled fetcher added
- [ ] Company list created (if ATS)
- [ ] API URL and parsing logic added
- [ ] Source type added to TypeScript types
- [ ] Content-type checking included
- [ ] Remote job filtering logic added
- [ ] Category mapping updated
- [ ] Manual testing completed
- [ ] Deploy and monitor
