import { NextResponse } from 'next/server';
import db from '@/lib/db';

const VALID_STATUSES = ['todo', 'in-progress', 'complete'];

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
  const values: (number | string | null)[] = [];

  if ('status' in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.push('status = ?');
    values.push(body.status);
  }
  if ('archived' in body) {
    updates.push('archived = ?');
    values.push(body.archived ? 1 : 0);
  }
  if ('topic' in body) {
    updates.push('topic = ?');
    values.push(body.topic);
  }
  if ('due_date' in body) {
    updates.push('due_date = ?');
    values.push(body.due_date);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  return NextResponse.json(updated);
}