import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "apps/jobs/.wrangler/state/v3/d1/miniflare-D1DatabaseObject");
let dbPath = "";

if (fs.existsSync(dbDir)) {
  const files = fs.readdirSync(dbDir);
  const sqliteFile = files.find(f => f.endsWith(".sqlite"));
  if (sqliteFile) {
    dbPath = path.join(dbDir, sqliteFile);
  }
}

if (!dbPath) {
    console.log("No local DB found");
    process.exit(1);
}

const db = new Database(dbPath);
const row = db.prepare("SELECT started_at FROM sync_history LIMIT 1").get();
console.log("Sample started_at:", row ? row.started_at : "No rows");
if (row) {
    console.log("Type:", typeof row.started_at);
}
