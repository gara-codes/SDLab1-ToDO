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
  const { title } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }

  const result = db
    .prepare('INSERT INTO todos (title, completed, archived) VALUES (?, 0, 0)')
    .run(title.trim());

  const newTodo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(result.lastInsertRowid);

  return NextResponse.json(newTodo, { status: 201 });
}