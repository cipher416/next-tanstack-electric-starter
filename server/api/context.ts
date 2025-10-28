import { db } from "@/db/client";

export type Context = {
  db: typeof db;
};

export function createContext(): Context {
  return { db };
}
