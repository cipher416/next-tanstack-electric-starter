import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

type Executor = {
  execute: typeof db.execute;
};

async function currentTxId(executor: Executor) {
  const result = await executor.execute<{ txid: string }>(
    sql`select pg_current_xact_id()::xid::text as txid`,
  );
  const txid = result.rows[0]?.txid;

  if (!txid) {
    throw new Error("Failed to read pg_current_xact_id()");
  }

  return Number(txid);
}

export async function listTodos() {
  return db.query.todos.findMany({
    orderBy: (todo, { asc }) => asc(todo.createdAt),
  });
}

export async function getTodo(id: string) {
  const [todo] = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id))
    .limit(1);
  return todo ?? null;
}

export async function createTodo(values: schema.NewTodo) {
  return db.transaction(async (tx) => {
    const [todo] = await tx
      .insert(schema.todos)
      .values({
        ...values,
        createdAt: values.createdAt ?? new Date(),
        updatedAt: values.updatedAt ?? new Date(),
      })
      .returning();

    const txid = await currentTxId(tx);

    return { todo, txid };
  });
}

export async function updateTodo(id: string, changes: Partial<schema.Todo>) {
  return db.transaction(async (tx) => {
    const [todo] = await tx
      .update(schema.todos)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(schema.todos.id, id))
      .returning();

    if (!todo) {
      throw new Error("Todo not found");
    }

    const txid = await currentTxId(tx);

    return { todo, txid };
  });
}

export async function deleteTodos(ids: string[]) {
  return db.transaction(async (tx) => {
    await tx.delete(schema.todos).where(inArray(schema.todos.id, ids));
    const txid = await currentTxId(tx);
    return { txid };
  });
}

export async function toggleTodoCompletion(id: string) {
  return db.transaction(async (tx) => {
    const [todo] = await tx
      .select()
      .from(schema.todos)
      .where(eq(schema.todos.id, id))
      .limit(1);

    if (!todo) {
      throw new Error("Todo not found");
    }

    const [updated] = await tx
      .update(schema.todos)
      .set({
        completed: !todo.completed,
        updatedAt: new Date(),
      })
      .where(eq(schema.todos.id, id))
      .returning();

    const txid = await currentTxId(tx);

    return { todo: updated, txid };
  });
}

export async function clearCompletedTodos() {
  return db.transaction(async (tx) => {
    const completedIds = await tx
      .select({ id: schema.todos.id })
      .from(schema.todos)
      .where(eq(schema.todos.completed, true));

    if (completedIds.length === 0) {
      return { txid: null };
    }

    await tx.delete(schema.todos).where(
      inArray(
        schema.todos.id,
        completedIds.map((row) => row.id),
      ),
    );

    const txid = await currentTxId(tx);

    return { txid };
  });
}
