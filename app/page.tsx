import db from '@/lib/db';
import TodoList from './TodoList';

export type Todo = {
  id: number;
  title: string;
  completed: number;
  archived: number;
};

export default function Home() {
  const todos = db.prepare('SELECT * FROM todos ORDER BY id DESC').all() as Todo[];

  return (
    <main className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>
      <TodoList initialTodos={todos} />
    </main>
  );
}