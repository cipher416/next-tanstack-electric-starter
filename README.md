# next-tanstack-electric-starter

Starter kit that combines Next.js 16 (App Router) with TanStack DB collections synced through ElectricSQL, Drizzle ORM migrations, and tRPC-powered server endpoints. The sample app is a live-synced todo list showcasing optimistic updates and Postgres persistence.

## Stack Highlights

- **Next.js 16 & React 19** for the web UI and routing (`app/`).
- **TanStack React DB + ElectricSQL** for realtime client state and sync (`lib/db/collections/`).
- **Drizzle ORM** for type-safe schema definitions and migrations (`db/` + `drizzle/` artifacts).
- **tRPC 11** for type-safe API procedures between the client and server (`server/api/`).

## Prerequisites

- Node.js ≥ 20 (Next 16 requirement). Install via `asdf`, `nvm`, or Volta.
- Docker Desktop (or compatible) to run Postgres and ElectricSQL.
- `bun` (ships with Node).

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```
2. Create a `.env.local`, see `.env.example`

3. Launch databases:
   ```bash
   docker compose up
   ```
   > Electric exports port `3000`; run the Next dev server on an alternate port (e.g. `bun dev -- --port 3001`) if you keep that binding.
4. Start the Next.js dev server:
   ```bash
   bun dev -- --port 3001
   ```
5. Visit http://localhost:3001 to interact with the todo demo.

## Useful Scripts

- `npm run dev` – start the Next.js development server.
- `npm run build` / `npm run start` – build and serve the production bundle.
- `npm run lint` – run ESLint 9 with the Next preset.
- `npm run typecheck` – run `tsc --noEmit`.
- `npm run db:generate` – emit Drizzle SQL migrations into `drizzle/`.
- `npm run db:push` / `npm run db:migrate` – sync schema to the Postgres database.
- `npm run db:studio` – open Drizzle Studio to inspect data.

## Project Structure

- `app/` – routes, layouts, and global styles for the App Router.
- `db/` – Drizzle schema (`schema.ts`) and Node Postgres client helpers (`client.ts`).
- `lib/trpc/` & `server/api/` – tRPC client bindings and router implementations.
- `lib/db/collections/` – ElectricSQL-aware TanStack collections.
- `public/` – static assets (favicons, images).
- `components/` – shared UI primitives (create as needed).

## Development Notes

- Run `bun lint` and `npm run typecheck` before committing.
- Use `bun db:generate` after editing `db/schema.ts` and commit the generated SQL.
- When introducing new features, add tests (Vitest/Playwright) under `tests/` or colocated `*.test.tsx` files and document the command in your PR.
- Contributor expectations, style rules, and PR conventions live in `AGENTS.md`.
