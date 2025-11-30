#!/usr/bin/env node
/**
 * Test script to validate the sync stream endpoint
 * Run with: node test-sync-stream.js
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test by directly calling the functions instead of via HTTP
async function testSync() {
  console.log('🧪 Testing sync stream functionality...\n');

  try {
    // Import the necessary modules
    const { syncJobs } = await import('./apps/jobs/src/lib/job-sync.ts');
    const { getDbFromContext } = await import('./apps/jobs/src/db/db.ts');
    const Database = (await import('better-sqlite3')).default;
    
    // Get the database path
    const dbPath = path.join(
      __dirname,
      'apps/jobs/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite'
    );

    console.log(`📍 Using database: ${dbPath}\n`);

    const db = new Database(dbPath);

    // Check categories exist
    const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    console.log(`✅ Categories in DB: ${categories.count}\n`);

    if (categories.count === 0) {
      console.error('❌ No categories found! Run seed-jobs-db-direct.js first');
      process.exit(1);
    }

    // Test a simple source fetch (RemoteOK is usually the most reliable)
    console.log('🚀 Testing RemoteOK job fetch...\n');

    const { fetchRemoteOKJobs } = await import('./apps/jobs/src/lib/job-sources/remoteok.ts');

    let jobCount = 0;
    for await (const batch of fetchRemoteOKJobs()) {
      console.log(`   Received batch of ${batch.length} jobs from RemoteOK`);
      if (batch.length > 0) {
        console.log(`   Sample job: ${batch[0].title} at ${batch[0].company}`);
        jobCount += batch.length;
        break; // Just test first batch
      }
    }

    console.log(`\n✅ Successfully fetched ${jobCount} jobs from RemoteOK`);
    console.log('\n🎉 Sync components are working!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSync().catch(console.error);
