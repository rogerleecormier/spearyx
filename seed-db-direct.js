import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(
  process.cwd(),
  "apps/app-web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/06a500e275bd2a50241cdcf76c189feed6a340311d3f01e9b730f2df0a30bb26.sqlite"
);

console.log("Seeding database at:", dbPath);

const db = new Database(dbPath);

const defaultCategories = [
  {
    name: "Programming & Development",
    slug: "programming-development",
    description:
      "Software development, web development, mobile apps, and coding roles",
  },
  {
    name: "Project Management",
    slug: "project-management",
    description:
      "Project managers, product managers, scrum masters, and agile roles",
  },
  {
    name: "Design",
    slug: "design",
    description:
      "UI/UX design, graphic design, product design, and creative roles",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Digital marketing, content marketing, SEO, and growth roles",
  },
  {
    name: "Data Science & Analytics",
    slug: "data-science-analytics",
    description:
      "Data scientists, analysts, machine learning engineers, and BI roles",
  },
  {
    name: "DevOps & Infrastructure",
    slug: "devops-infrastructure",
    description:
      "DevOps engineers, SRE, cloud architects, and infrastructure roles",
  },
  {
    name: "Customer Support",
    slug: "customer-support",
    description: "Customer service, technical support, and success roles",
  },
  {
    name: "Sales",
    slug: "sales",
    description:
      "Sales representatives, account executives, and business development",
  },
];

console.log("Inserting categories...");

const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?)"
);

defaultCategories.forEach((category) => {
  const now = Math.floor(Date.now() / 1000);
  const result = insertCategory.run(
    category.name,
    category.slug,
    category.description,
    now
  );
  if (result.changes > 0) {
    console.log(`✅ Added: ${category.name}`);
  } else {
    console.log(`ℹ️  Skipped: ${category.name} (already exists)`);
  }
});

const count = db.prepare("SELECT COUNT(*) as count FROM categories").get();
console.log(`\n✅ Database seeded! Total categories: ${count.count}`);
