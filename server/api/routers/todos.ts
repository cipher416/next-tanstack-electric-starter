import { z } from "zod";

import {
  clearCompletedTodos,
  createTodo,
  deleteTodos,
  listTodos,
  toggleTodoCompletion,
  updateTodo,
} from "@/db/client";

import { publicProcedure, router } from "../trpc";

const baseTodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const todosRouter = router({
  all: publicProcedure.query(async () => listTodos()),
  create: publicProcedure
    .input(baseTodoSchema)
    .mutation(async ({ input }) => {
      const { todo, txid } = await createTodo({
        ...input,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      });
      return { todo, txid };
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        changes: z
          .object({
            title: z.string().optional(),
            completed: z.boolean().optional(),
            createdAt: z.coerce.date().optional(),
            updatedAt: z.coerce.date().optional(),
          })
          .refine((value) => Object.keys(value).length > 0, {
            message: "No changes provided",
          }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, changes } = input;
      const { todo, txid } = await updateTodo(id, changes);
      return { todo, txid };
    }),
  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => toggleTodoCompletion(input.id)),
  delete: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ input }) => deleteTodos(input.ids)),
  clearCompleted: publicProcedure.mutation(async () => clearCompletedTodos()),
});
