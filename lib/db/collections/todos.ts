"use client";

import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

import type { Todo } from "@/db/schema";
import { trpcClient } from "@/lib/trpc/client";

const defaultShapeUrl = "/api/electric/todos";
const shapeUrl = process.env.NEXT_PUBLIC_ELECTRIC_SHAPE_URL ?? defaultShapeUrl;

export const todosCollection = createCollection<Todo>(
  electricCollectionOptions<Todo>({
    id: "todos",
    getKey: (todo) => todo.id,
    shapeOptions: {
      url: shapeUrl,
      params: { table: "todos" },
    },
    onInsert: async ({ transaction }) => {
      const [{ modified }] = transaction.mutations;
      const result = await trpcClient.todos.create.mutate(modified);
      return { txid: result.txid };
    },
    onUpdate: async ({ transaction }) => {
      const [{ original, changes }] = transaction.mutations;
      const id = (original as Partial<Todo>)?.id;

      if (!id) {
        throw new Error("Missing todo id for update");
      }

      const result = await trpcClient.todos.update.mutate({
        id,
        changes,
      });

      return { txid: result.txid };
    },
    onDelete: async ({ transaction }) => {
      const ids = transaction.mutations.map((mutation) => {
        const key = mutation.key ?? (mutation.original as Partial<Todo>)?.id;
        if (!key) {
          throw new Error("Missing key for delete mutation");
        }
        return String(key);
      });

      const result = await trpcClient.todos.delete.mutate({ ids });
      return { txid: result.txid };
    },
  }),
);
