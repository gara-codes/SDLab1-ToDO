import Database from 'better-sqlite3';

const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

export default db;