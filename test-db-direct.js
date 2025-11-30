import Database from 'better-sqlite3';
import path from 'path';

// Open the D1 database directly
const dbPath = path.join(
  process.cwd(),
  'apps/app-web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite'
);

console.log('Opening database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if tables exist
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table'
  `).all();
  
  console.log('\nTables:', tables.map(t => t.name).join(', '));
  
  // Check categories count
  const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  console.log('\nCategories count:', categories);
  
  // Check jobs count
  const jobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get();
  console.log('Jobs count:', jobs);
  
  // Show first few categories
  const catList = db.prepare('SELECT id, name FROM categories LIMIT 5').all();
  console.log('\nCategories:', catList);
  
  // Try inserting a test job
  console.log('\nAttempting to insert test job...');
  try {
    const insert = db.prepare(`
      INSERT INTO jobs (title, company, description, pay_range, source_url, source_name, category_id, remote_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      'Direct DB Test Job',
      'Test Company',
      'This is a test',
      '$100,000 - $150,000',
      'https://test.example.com/direct-' + Date.now(),
      'DirectTest',
      1,
      'fully_remote'
    );
    
    console.log('✅ Insert successful! Result:', result);
  } catch (err) {
    console.log('❌ Insert failed:', err instanceof Error ? err.message : err);
  }
  
  // Check updated job count
  const jobsAfter = db.prepare('SELECT COUNT(*) as count FROM jobs').get();
  console.log('Jobs count after:', jobsAfter);
  
  db.close();
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
