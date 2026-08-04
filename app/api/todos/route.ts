import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const todos = db
    .prepare('SELECT * FROM todos WHERE archived = 0 ORDER BY id DESC')
    .all();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, topic, due_date } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const result = db
    .prepare(
      'INSERT INTO todos (title, topic, status, due_date, archived) VALUES (?, ?, ?, ?, 0)'
    )
    .run(title.trim(), topic?.trim() || '', 'todo', due_date || null);

  const newTodo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(result.lastInsertRowid);

  return NextResponse.json(newTodo, { status: 201 });
}