import Database from 'better-sqlite3';

const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0
  )
`);

// Migration safety net: if the table already existed from before
// this change, add the column if it's missing.
const columns = db.prepare(`PRAGMA table_info(todos)`).all() as { name: string }[];
const hasArchived = columns.some((col) => col.name === 'archived');
if (!hasArchived) {
  db.exec(`ALTER TABLE todos ADD COLUMN archived INTEGER DEFAULT 0`);
}

export default db;