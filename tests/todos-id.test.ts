import { describe, it, expect, beforeAll } from 'vitest';
import { POST, GET } from '../app/api/todos/route';
import { PATCH } from '../app/api/todos/[id]/route';

describe('/api/todos/[id]', () => {
  let createdId: number;

  beforeAll(async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Finish report', topic: 'Work' }),
    });
    const response = await POST(request);
    const todo = await response.json();
    createdId = todo.id;
  });

  it('updates status to a valid value', async () => {
    const request = new Request(`http://localhost/api/todos/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: String(createdId) }) });
    const updated = await response.json();

    expect(response.status).toBe(200);
    expect(updated.status).toBe('in-progress');
  });

  it('rejects an invalid status value', async () => {
    const request = new Request(`http://localhost/api/todos/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'not-a-real-status' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: String(createdId) }) });
    expect(response.status).toBe(400);
  });

  it('archiving a task hides it from GET but keeps it in the database', async () => {
    const archiveRequest = new Request(`http://localhost/api/todos/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    });
    await PATCH(archiveRequest, { params: Promise.resolve({ id: String(createdId) }) });

    const listResponse = await GET();
    const todos = await listResponse.json();
    const stillListed = todos.some((t: { id: number }) => t.id === createdId);

    expect(stillListed).toBe(false);
  });

  it('returns 404 when updating a non-existent todo', async () => {
    const request = new Request('http://localhost/api/todos/999999', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'complete' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '999999' }) });
    expect(response.status).toBe(404);
  });
});