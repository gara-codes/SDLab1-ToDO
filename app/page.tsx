import db from '@/lib/db';
import TodoList from './TodoList';

export type Status = 'todo' | 'in-progress' | 'complete';

export type Todo = {
  id: number;
  title: string;
  topic: string;
  status: Status;
  due_date: string | null;
  archived: number;
};

export default function Home() {
  const todos = db
    .prepare('SELECT * FROM todos ORDER BY id DESC')
    .all() as Todo[];

  return (
    <main className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>
      <TodoList initialTodos={todos} />
    </main>
  );
}