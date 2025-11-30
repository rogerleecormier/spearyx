import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(
  process.cwd(),
  'apps/app-web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite'
);

console.log('Seeding database at:', dbPath);

const db = new Database(dbPath);

const defaultCategories = [
  {
    name: 'Programming & Development',
    slug: 'programming-development',
    description: 'Software development, web development, mobile apps, and coding roles',
  },
  {
    name: 'Project Management',
    slug: 'project-management',
    description: 'Project managers, product managers, scrum masters, and agile roles',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design, graphic design, product design, and creative roles',
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Digital marketing, content marketing, SEO, and growth roles',
  },
  {
    name: 'Data Science & Analytics',
    slug: 'data-science-analytics',
    description: 'Data scientists, analysts, machine learning engineers, and BI roles',
  },
  {
    name: 'DevOps & Infrastructure',
    slug: 'devops-infrastructure',
    description: 'DevOps engineers, SRE, cloud architects, and infrastructure roles',
  },
  {
    name: 'Customer Support',
    slug: 'customer-support',
    description: 'Customer service, technical support, and success roles',
  },
  {
    name: 'Sales',
    slug: 'sales',
    description: 'Sales representatives, account executives, and business development',
  },
];

try {
  console.log('Inserting categories...');
  
  const insert = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, description)
    VALUES (?, ?, ?)
  `);
  
  let count = 0;
  for (const category of defaultCategories) {
    const result = insert.run(category.name, category.slug, category.description);
    if (result.changes > 0) {
      count++;
      console.log(`✅ Added: ${category.name}`);
    } else {
      console.log(`⏭️  Skipped: ${category.name} (already exists)`);
    }
  }
  
  // Verify
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  console.log(`\n✅ Database seeded! Total categories: ${categoryCount.count}`);
  
  db.close();
} catch (err) {
  console.error('❌ Error seeding database:', err instanceof Error ? err.message : err);
  db.close();
  process.exit(1);
}
