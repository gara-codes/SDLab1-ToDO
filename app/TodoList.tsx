'use client';

import { useState } from 'react';
import type { Todo, Status } from './page';

const STATUSES: Status[] = ['todo', 'in-progress', 'complete'];

const STATUS_LABELS: Record<Status, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  complete: 'Complete',
};

const STATUS_ORDER: Record<Status, number> = {
  todo: 0,
  'in-progress': 1,
  complete: 2,
};

type SortKey = 'default' | 'topic' | 'status' | 'due_date';

function sortTodos(todos: Todo[], sortKey: SortKey): Todo[] {
  const sorted = [...todos];

  if (sortKey === 'topic') {
    sorted.sort((a, b) => a.topic.localeCompare(b.topic));
  } else if (sortKey === 'status') {
    sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  } else if (sortKey === 'due_date') {
    sorted.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1; // tasks with no due date sink to the bottom
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  }

  return sorted;
}

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.status === 'complete') return false;
  const today = new Date().toISOString().slice(0, 10);
  return todo.due_date < today;
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('default');

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        topic: newTopic,
        due_date: newDueDate || null,
      }),
    });
    const created = await res.json();

    setTodos([created, ...todos]);
    setNewTitle('');
    setNewTopic('');
    setNewDueDate('');
  }

  async function updateStatus(id: number, status: Status) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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

  const filteredTodos = todos.filter((t) => (showArchived ? true : !t.archived));
  const visibleTodos = sortTodos(filteredTodos, sortKey);

  return (
    <div>
      <form onSubmit={addTodo} className="flex flex-col gap-2 mb-4 sm:flex-row">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Task title..."
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Topic..."
          className="border rounded px-3 py-2 sm:w-40"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived tasks
        </label>

        <label className="flex items-center gap-2 text-gray-600">
          Sort by:
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border rounded px-2 py-1"
          >
            <option value="default">Date added</option>
            <option value="topic">Topic</option>
            <option value="status">Status</option>
            <option value="due_date">Due date</option>
          </select>
        </label>
      </div>

      <ul className="space-y-2">
        {visibleTodos.map((todo) => {
          const overdue = isOverdue(todo);
          return (
            <li
              key={todo.id}
              className={`flex flex-col gap-2 border rounded px-3 py-2 sm:flex-row sm:items-center ${
                todo.archived ? 'bg-gray-100' : overdue ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <div className="flex-1">
                <span
                  className={`${todo.archived ? 'italic text-gray-400' : ''} ${
                    todo.status === 'complete' ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {todo.title}
                </span>
                {todo.topic && (
                  <span className="ml-2 text-xs text-gray-500">[{todo.topic}]</span>
                )}
                {todo.due_date && (
                  <span className="ml-2 text-xs text-gray-500">Due {todo.due_date}</span>
                )}
                {overdue && (
                  <span className="ml-2 text-xs font-semibold text-red-600">⚠ Overdue</span>
                )}
                {!!todo.archived && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-gray-400">
                    (archived)
                  </span>
                )}
              </div>

              <select
                value={todo.status}
                onChange={(e) => updateStatus(todo.id, e.target.value as Status)}
                disabled={!!todo.archived}
                className="border rounded px-2 py-1 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => archiveTodo(todo.id, !!todo.archived)}
                className="text-gray-500 text-sm"
              >
                {todo.archived ? 'Unarchive' : 'Archive'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}