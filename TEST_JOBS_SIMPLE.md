# Test Job Entries for Database Sync Testing

These are clean, simple test entries without encoding issues or special characters. Use these to verify your database insert functionality.

## Quick Start

### Option 1: Test via API (Easiest)

With the dev server running (`npx turbo run dev`), simply visit:

```
http://localhost:5173/api/test-jobs
```

This will insert all 5 test jobs and return:

```json
{
  "success": true,
  "message": "Test jobs inserted",
  "inserted": 5,
  "total": 5
}
```

### Option 2: View Test Data

Run the test data script to see what will be inserted:

```bash
cd apps/app-web
node test-insert.js
```

This will display all 5 test jobs in a readable format.

## 5 Simple Test Jobs

```json
[
  {
    "title": "Senior Software Engineer",
    "company": "TechCorp",
    "description": "Build scalable backend systems. 5+ years required. Strong in Java or Go.",
    "payRange": "$150,000 - $200,000",
    "sourceUrl": "https://test.example.com/job-1",
    "sourceName": "TestSource",
    "categoryId": 1
  },
  {
    "title": "Product Manager",
    "company": "StartupInc",
    "description": "Lead product strategy and roadmap for our B2B SaaS platform.",
    "payRange": "$120,000 - $160,000",
    "sourceUrl": "https://test.example.com/job-2",
    "sourceName": "TestSource",
    "categoryId": 1
  },
  {
    "title": "DevOps Engineer",
    "company": "CloudTech",
    "description": "Manage Kubernetes clusters and CI/CD pipelines on AWS.",
    "payRange": "$130,000 - $180,000",
    "sourceUrl": "https://test.example.com/job-3",
    "sourceName": "TestSource",
    "categoryId": 1
  },
  {
    "title": "Data Analyst",
    "company": "AnalyticsPlus",
    "description": "Analyze data and create insights using SQL and Python.",
    "payRange": "$90,000 - $130,000",
    "sourceUrl": "https://test.example.com/job-4",
    "sourceName": "TestSource",
    "categoryId": 5
  },
  {
    "title": "UX Designer",
    "company": "DesignStudio",
    "description": "Create user experiences using Figma and user research.",
    "payRange": "$100,000 - $140,000",
    "sourceUrl": "https://test.example.com/job-5",
    "sourceName": "TestSource",
    "categoryId": 4
  }
]
```

## Verification

After running the API, you should see 5 new jobs in your database. You can verify:

1. **Via Sync Page**: http://localhost:5173/jobs/sync - Run a quick sync and check the report
2. **Via Jobs API**: http://localhost:5173/api/jobs - Should list the test jobs
3. **Via Terminal**: Query the local D1 database directly

## Key Features of Test Data

✅ **Clean text only** - No HTML or encoding issues  
✅ **Short descriptions** - Under 500 chars each  
✅ **Standard ASCII** - No mangled UTF-8  
✅ **Simple formats** - Standard salary "$X - $Y"  
✅ **Unique URLs** - test.example.com/job-1 through job-5

## Troubleshooting

If the API returns an error:

1. Make sure the dev server is running: `npx turbo run dev`
2. Check that D1 is properly initialized in `.wrangler/state/v3/d1/`
3. Verify the route is accessible by checking browser console for network errors
4. Check for TypeScript compilation errors in the terminal

## Next Steps

Once test data inserts successfully:

1. Check that the UTF-8 sanitization is working
2. Test with real job data from job sources
3. Verify the sync page shows updated counts
4. Monitor for any encoding issues in the real data
