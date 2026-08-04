# Documentation

## Third-Party Code

| Package | Why it was chosen |
|---|---|
| `next` | Provides the React framework, routing, and API route handlers used for both frontend and backend in a single app. |
| `react` / `react-dom` | Required peer dependencies of Next.js for building the UI. |
| `typescript` | Adds static typing, catching mismatches (e.g. between the database schema and frontend types) at compile time. |
| `better-sqlite3` | A synchronous SQLite driver — no async/await needed for queries, which keeps the database code simple for a small local app. |
| `@types/better-sqlite3` | Type definitions for `better-sqlite3`, since the library itself ships as plain JavaScript. |
| `tailwindcss` | Utility-first CSS used for styling the UI directly in JSX, avoiding separate stylesheet files for a small project. |
| `eslint` | Lints the codebase for common mistakes during development. |
| `vitest` | Test runner used to exercise the API route handlers directly, chosen for its speed and native TypeScript support without extra configuration. |

## Database Design

The application uses a single SQLite database file (`todos.db`), created automatically on first run. There is one table, `todos`, with no relationships to other tables (a single-table design was sufficient for this app's scope).

### Table: `todos`

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Uniquely identifies each task. |
| `title` | `TEXT NOT NULL` | The task's description. |
| `topic` | `TEXT NOT NULL DEFAULT ''` | Free-text category, used for sorting. |
| `status` | `TEXT NOT NULL DEFAULT 'todo'` | One of three fixed values: `todo`, `in-progress`, `complete`. Enforced at the application layer (see `app/api/todos/[id]/route.ts`), not by a database constraint. |
| `due_date` | `TEXT` (nullable) | Stored as an ISO `YYYY-MM-DD` string, which sorts and compares correctly as plain text. Used to compute overdue status at render time. |
| `archived` | `INTEGER NOT NULL DEFAULT 0` | `0` or `1`. Tasks are never deleted — archiving sets this flag instead, and archived tasks remain queryable and viewable, just excluded from the default list view. |

There is no `completed` boolean column; task progress is tracked entirely through `status`, and "overdue" is a derived/computed property (comparing `due_date` to the current date), not a stored column or status value.

## Running It

**Requirements:** Node.js 18.18 or later (Node 20 LTS recommended).

From a clean clone, with nothing else to hand:

```bash
git clone <this-repository-url>
cd todo-app
npm install
npm run dev
```

Then open `http://localhost:3000` in a browser. The SQLite database file (`todos.db`) and its schema are created automatically on first run — no manual database setup is required.

**Running the tests:**

```bash
npm test
```

This runs all test files under `tests/` using Vitest against an in-memory SQLite database, so it does not affect `todos.db` or require the dev server to be running.

**Note:** `better-sqlite3` includes a native module that is installed automatically via `npm install`. On most platforms this uses a prebuilt binary and requires nothing further; on unsupported platforms `npm install` may need a C++ build toolchain, but this has not been an issue on standard Windows/macOS/Linux setups.