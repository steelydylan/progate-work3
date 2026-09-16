import { useState, useEffect, type FormEvent } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputTitle, setInputTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // やること一覧の読み込み
  const fetchTodos = async () => {
    try {
      setError(null);
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError("やることリストの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // やることの追加
  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    const title = inputTitle.trim();
    if (!title) return;

    try {
      setError(null);
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("追加に失敗しました");
      const newTodo: Todo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      setInputTitle("");
    } catch (err) {
      console.error(err);
      setError("やることを追加できませんでした");
    }
  };

  // 完了状態の切り替え
  const handleToggleTodo = async (id: number, currentCompleted: boolean) => {
    try {
      setError(null);
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      if (!res.ok) throw new Error("更新に失敗しました");
      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error(err);
      setError("状態の更新に失敗しました");
    }
  };

  // やることの削除
  const handleDeleteTodo = async (id: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("削除に失敗しました");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError("やることを削除できませんでした");
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            やることリスト
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            やることを記録して、終わったらチェックや削除ができます
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* やること追加フォーム */}
          <form onSubmit={handleAddTodo} className="border-b border-slate-100 p-5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="新しいやることを入力..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={!inputTitle.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                追加
              </button>
            </div>
          </form>

          {/* フィルター & ステータスバー */}
          {todos.length > 0 && (
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-medium text-slate-500">
              <span>
                残り {activeCount} 件 / 全 {todos.length} 件
              </span>
              <div className="flex gap-1 rounded-lg bg-slate-200/70 p-1">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    filter === "all"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  すべて ({todos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    filter === "active"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  未完了 ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("completed")}
                  className={`rounded-md px-2.5 py-1 transition ${
                    filter === "completed"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  完了済み ({completedCount})
                </button>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-rose-50 px-5 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* やることリスト */}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-slate-400">
                読み込み中...
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                {todos.length === 0
                  ? "やることがまだ登録されていません"
                  : "該当するやることがありません"}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50/70"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id, todo.completed)}
                      className="h-5 w-5 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`text-sm break-all select-none ${
                        todo.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {todo.title}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
                    title="削除"
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
