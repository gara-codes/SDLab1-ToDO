'use client';

import { useState } from 'react';
import type { Todo } from './page';

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTitle, setNewTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    const created = await res.json();

    setTodos([created, ...todos]);
    setNewTitle('');
  }

  async function toggleTodo(id: number, completed: boolean) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  }

  async function archiveTodo(id: number, archived: boolean) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !archived }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  }

  const visibleTodos = todos.filter((t) =>
    showArchived ? true : !t.archived
  );

  return (
    <div>
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new todo..."
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>

      <label className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived tasks
      </label>

      <ul className="space-y-2">
        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            className={`flex items-center gap-2 border rounded px-3 py-2 ${
              todo.archived ? 'bg-gray-100' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={!!todo.completed}
              onChange={() => toggleTodo(todo.id, !!todo.completed)}
              disabled={!!todo.archived}
            />
            <span
              className={`flex-1 ${
                todo.completed ? 'line-through text-gray-400' : ''
              } ${todo.archived ? 'italic text-gray-400' : ''}`}
            >
              {todo.title}
              {!!todo.archived && (
                <span className="ml-2 text-xs uppercase tracking-wide">
                  (archived)
                </span>
              )}
            </span>
            <button
              onClick={() => archiveTodo(todo.id, !!todo.archived)}
              className="text-gray-500 text-sm"
            >
              {todo.archived ? 'Unarchive' : 'Archive'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}