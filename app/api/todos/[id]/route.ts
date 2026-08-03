import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!existing) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const values: (number | string)[] = [];

  if ('completed' in body) {
    updates.push('completed = ?');
    values.push(body.completed ? 1 : 0);
  }
  if ('archived' in body) {
    updates.push('archived = ?');
    values.push(body.archived ? 1 : 0);
  }

  if (updates.length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }

  values.push(id);
  db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`).run(
    ...values
  );

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  return NextResponse.json(updated);
}