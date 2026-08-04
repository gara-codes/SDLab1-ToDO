import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || 'todos.db';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    topic TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo',
    due_date TEXT,
    archived INTEGER NOT NULL DEFAULT 0
  )
`);

// Migration safety net for a todos.db created before this schema existed
const columns = db.prepare(`PRAGMA table_info(todos)`).all() as { name: string }[];
const columnNames = columns.map((c) => c.name);

if (!columnNames.includes('archived')) {
  db.exec(`ALTER TABLE todos ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`);
}
if (!columnNames.includes('topic')) {
  db.exec(`ALTER TABLE todos ADD COLUMN topic TEXT NOT NULL DEFAULT ''`);
}
if (!columnNames.includes('status')) {
  db.exec(`ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'todo'`);
}
if (!columnNames.includes('due_date')) {
  db.exec(`ALTER TABLE todos ADD COLUMN due_date TEXT`);
}

export default db;