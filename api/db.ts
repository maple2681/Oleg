import Database from "better-sqlite3";
import { CARS } from "../src/data/cars.js";

// Determine DB location: Vercel serverless has a writable /tmp directory
const dbPath = process.env.VERCEL ? "/tmp/database.sqlite" : "database.sqlite";

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    data TEXT
  );
`);

// Seed cars if empty
const count = db.prepare("SELECT COUNT(*) as count FROM cars").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO cars (id, data) VALUES (?, ?)");
  for (const car of CARS) {
    insert.run(car.id, JSON.stringify(car));
  }
}

export default db;
