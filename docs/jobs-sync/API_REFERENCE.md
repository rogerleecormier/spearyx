# V3 API Reference

Complete API reference for V3 sync and data endpoints.

---

## Base URL

```
https://jobs.spearyx.com/api/v3
```

---

## Sync Endpoints

### POST `/sync/ats`

Sync jobs from one ATS company (Greenhouse or Lever).

**Request:**
```bash
curl -X POST https://jobs.spearyx.com/api/v3/sync/ats \
  -H "Content-Type: application/json"
```

**Response (Success):**
```json
{
  "success": true,
  "source": "greenhouse",
  "company": "stripe",
  "jobsAdded": 5,
  "jobsUpdated": 12,
  "jobsDeleted": 0,
  "duration": 1234
}
```

**Response (Failure):**
```json
{
  "success": false,
  "source": "greenhouse",
  "company": "invalid-company",
  "error": "HTTP 404",
  "duration": 523
}
```

---

### POST `/sync/aggregator`

Sync jobs from RemoteOK or Himalayas.

**Request:**
```bash
curl -X POST https://jobs.spearyx.com/api/v3/sync/aggregator \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "source": "remoteok",
  "jobsAdded": 15,
  "jobsUpdated": 45,
  "jobsDeleted": 0,
  "duration": 2341
}
```

---

### POST `/sync/discovery`

Discover new companies with remote job boards.

**Request:**
```bash
curl -X POST https://jobs.spearyx.com/api/v3/sync/discovery \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "companiesChecked": 5,
  "companiesDiscovered": 1,
  "duration": 3456
}
```

---

## Data Endpoints

### GET `/jobs`

Fetch job listings with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Full-text search query |
| `category` | number | Category ID filter |
| `source` | string | Source filter (Greenhouse, Lever, RemoteOK, Himalayas) |
| `salaryRange` | string | Format: `min-max` or `min+` (e.g., `100000-150000`) |
| `includeNoSalary` | boolean | Include jobs without salary info |
| `sortBy` | string | `newest`, `oldest`, `title-asc`, `title-desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Request:**
```bash
curl "https://jobs.spearyx.com/api/v3/jobs?search=engineer&category=1&sortBy=newest&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 123,
        "title": "Senior Software Engineer",
        "company": "Stripe",
        "description": "We are looking for...",
        "payRange": "$150,000 - $200,000",
        "sourceUrl": "https://boards.greenhouse.io/stripe/jobs/12345",
        "sourceName": "Greenhouse",
        "category": {
          "id": 1,
          "name": "Programming & Development",
          "slug": "programming-development"
        },
        "createdAt": "2024-12-07T12:00:00Z"
      }
    ],
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### GET `/categories`

Fetch all categories with job counts.

**Request:**
```bash
curl "https://jobs.spearyx.com/api/v3/categories"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Programming & Development",
      "slug": "programming-development",
      "jobCount": 450
    },
    {
      "id": 2,
      "name": "Project Management",
      "slug": "project-management",
      "jobCount": 85
    }
  ]
}
```

---

### GET `/job-content`

Fetch full job description with lazy cleansing.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Source URL of the job |
| `company` | string | Yes | Company slug/name |

**Request:**
```bash
curl "https://jobs.spearyx.com/api/v3/job-content?url=https://boards.greenhouse.io/stripe/jobs/12345&company=stripe"
```

**Response:**
```json
{
  "content": "<h2>About the Role</h2><p>We are looking for...</p>"
}
```

**Error Response:**
```json
{
  "error": "Could not extract Greenhouse job ID",
  "url": "https://invalid-url.com/job"
}
```

---

### GET `/stats`

Fetch dashboard statistics.

**Request:**
```bash
curl "https://jobs.spearyx.com/api/v3/stats"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalJobs": 1250,
    "jobsBySource": {
      "Greenhouse": 450,
      "Lever": 320,
      "RemoteOK": 280,
      "Himalayas": 200
    },
    "discoveredCompanies": 85,
    "pendingCompanies": 42,
    "workerStatus": {
      "ats": {
        "lastSync": "2024-12-07T19:55:00Z",
        "status": "completed",
        "lastCompany": "stripe"
      },
      "aggregator": {
        "lastSync": "2024-12-07T19:56:00Z",
        "status": "completed",
        "lastSource": "remoteok"
      },
      "discovery": {
        "lastSync": "2024-12-07T19:54:00Z",
        "status": "completed"
      }
    }
  }
}
```

---

### GET `/logs`

Fetch recent sync logs.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of log entries |

**Request:**
```bash
curl "https://jobs.spearyx.com/api/v3/logs?limit=10"
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid-123",
      "syncType": "job_sync",
      "source": "greenhouse",
      "status": "completed",
      "startedAt": "2024-12-07T19:55:00Z",
      "completedAt": "2024-12-07T19:55:05Z",
      "stats": {
        "jobsAdded": 5,
        "jobsUpdated": 12,
        "company": "stripe"
      },
      "logs": [
        {
          "timestamp": "2024-12-07T19:55:01Z",
          "type": "info",
          "message": "Starting sync for stripe"
        },
        {
          "timestamp": "2024-12-07T19:55:05Z",
          "type": "success",
          "message": "stripe: 5 added, 12 updated"
        }
      ]
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details if available"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters)
- `500` - Server Error
