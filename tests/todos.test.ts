import { describe, it, expect } from 'vitest';
import { GET, POST } from '../app/api/todos/route';

describe('/api/todos', () => {
  it('POST creates a new todo with status "todo" by default', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Write unit tests', topic: 'Testing' }),
    });

    const response = await POST(request);
    const todo = await response.json();

    expect(response.status).toBe(201);
    expect(todo.title).toBe('Write unit tests');
    expect(todo.status).toBe('todo');
    expect(todo.archived).toBe(0);
  });

  it('POST rejects an empty title', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('GET returns created todos', async () => {
    const response = await GET();
    const todos = await response.json();

    expect(Array.isArray(todos)).toBe(true);
    expect(todos.some((t: { title: string }) => t.title === 'Write unit tests')).toBe(true);
  });
});