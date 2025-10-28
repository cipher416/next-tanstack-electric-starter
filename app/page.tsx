"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { todosCollection } from "@/lib/db/collections/todos";

const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please enter a task")
    .max(120, "Keep it under 120 characters"),
});

export default function Home() {
  const { data, isLoading, isError, status } = useLiveQuery((q) =>
    q
      .from({ todo: todosCollection })
      .orderBy(({ todo }) => todo.createdAt, "asc"),
  );

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onChange: todoSchema,
      onSubmit: todoSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const { title } = todoSchema.parse(value);
      const now = new Date();

      todosCollection.insert({
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      });

      formApi.reset();
    },
  });

  const toggleTodo = (id: string) => {
    todosCollection.update(id, (draft) => {
      draft.completed = !draft.completed;
      draft.updatedAt = new Date();
    });
  };

  const removeTodo = (id: string) => {
    todosCollection.delete(id);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 p-10 font-sans">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Todos</h1>
        <p className="text-sm text-zinc-500">
          TanStack DB + ElectricSQL + Drizzle with optimistic sync.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="flex gap-2"
      >
        <form.Field name="title">
          {(field) => (
            <div className="flex flex-1 flex-col gap-1">
              <input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="Add a task"
                className="rounded border border-zinc-200 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
              />
              {field.state.meta.errors[0] && (
                <p className="text-xs text-red-500">
                  {"message" in field.state.meta.errors[0]
                    ? field.state.meta.errors[0].message
                    : String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Adding…" : "Add"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <section className="space-y-4">
        Query Status : {status}
        {isLoading && <p className="text-sm text-zinc-500">Syncing todos…</p>}
        <ul className="space-y-2">
          {data.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded border border-zinc-200 bg-background/50 px-4 py-3 shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span
                  className={`size-4 rounded border ${
                    todo.completed ? "bg-white" : "border-zinc-300"
                  }`}
                />
                <span
                  className={
                    todo.completed
                      ? "text-sm text-zinc-400 line-through"
                      : "text-sm"
                  }
                >
                  {todo.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeTodo(todo.id)}
                className="text-xs font-medium text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {data.length === 0 && (
          <p className="text-sm text-zinc-400">
            No todos yet. Add one above to get started.
          </p>
        )}
        {isError && (
          <p className="text-sm text-red-500">
            No todos yet. Add one above to get started.
          </p>
        )}
      </section>
    </main>
  );
}
