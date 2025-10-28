# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router entrypoints (`layout.tsx`, `page.tsx`) and global styles in `globals.css`.
- `lib/db/collections/` defines ElectricSQL-aware TanStack collections that power optimistic client updates.
- `server/api/` contains tRPC routers, context, and server bindings for syncing mutations back to Postgres.
- `db/` holds the Drizzle schema (`schema.ts`) and Node Postgres client helpers (`client.ts`).
- `components/` is reserved for shared UI primitives; prefer colocated folders when authoring new widgets.
- `public/` stores static assets such as icons or OpenGraph images.

## Build, Test, and Development Commands
- `npm run dev` starts the Next 16 dev server with React 19 fast refresh.
- `npm run build` compiles the production bundle; use before shipping infrastructure changes.
- `npm run lint` runs ESLint 9 with the Next config; fix or suppress findings before review.
- `npm run typecheck` executes `tsc --noEmit`; keep the TypeScript surface free of `any`.
- `npm run db:generate | db:push | db:migrate` manage Drizzle migrations; run against a Postgres instance exposed via `docker-compose.yaml`.
- `npm run db:studio` opens Drizzle Studio for inspecting tables during debugging.

## Coding Style & Naming Conventions
- TypeScript is required; prefer inference over explicit types unless clarity suffers.
- Use 2-space indentation, PascalCase for React components, camelCase for functions/variables, and SCREAMING_SNAKE_CASE only for env constants.
- Follow the patterns in `app/page.tsx` for TanStack form hooks and Tailwind utility classes; avoid bespoke CSS unless necessary.
- Run ESLint before committing; add targeted `eslint-disable` comments with justification and scope.

## Testing Guidelines
- No test runner ships out-of-the-box; when introducing new behavior, add Vitest or Playwright tests under `tests/` or colocate `*.test.ts(x)` files and document the command in your PR.
- Always cover server data flows (`db/client.ts`, `server/api/`) with integration tests or mock-backed unit tests; accompany schema changes with fixture updates.
- At minimum, run `npm run lint` and `npm run typecheck` locally before requesting review.

## Data & Environment Notes
- Provide a `.env.local` with `DATABASE_URL` for Drizzle and `NEXT_PUBLIC_ELECTRIC_SHAPE_URL` when targeting remote Electric hubs; defaults fall back to `/api/electric/todos`.
- Keep migrations idempotent and ordered; use `drizzle/` for generated SQL artifacts and commit them when they matter to deployment.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `chore:`, `fix:`, etc.) as seen in history (`feat: setup trpc and electric`); keep subject lines under 72 characters.
- Squash small fixes locally to maintain focused commits that map to reviewable units of work.
- PRs should summarize scope, list manual test steps, reference issues, and include screenshots or Looms for UI-visible changes.
- Call out new env vars, migration impacts, or background jobs in the PR description so deployers can prepare.
