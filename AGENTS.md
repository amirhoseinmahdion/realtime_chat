# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independent TypeScript applications:

- `front/`: Next.js App Router client. Routes and layouts live in `front/src/app/`; reusable UI, hooks, and utilities belong under `front/src/components/`, `front/src/hooks/`, and `front/src/lib/`. Static assets belong in `front/public/`.
- `back/`: Express and Socket.IO server. `src/app.ts` configures Express; `src/server.ts` owns the HTTP and Socket.IO server. Add domain code under `src/modules/`, middleware under `src/middleware/`, and tests under `back/tests/`.
- `docs/`: product, architecture, stack, feature backlog, active-task, and completion records.

Keep browser code out of `back/` and database or JWT logic out of `front/`. Generated `.next/`, `dist/`, SQLite, coverage, and environment files are ignored.

## Build, Test, and Development Commands

Run commands within the relevant application:

```bash
cd front && npm run dev       # Next.js on localhost:3000
cd back && npm run dev        # Express/Socket.IO on localhost:4000
npm run lint                  # application ESLint checks
npm run typecheck             # strict TypeScript without emitting files
npm run build                 # production compilation
npm start                     # run a completed production build
```

Install each application separately with `npm install`. Copy `.env.example` to `.env.local` in `front/` and `.env` in `back/` before local development.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, double quotes, and strict TypeScript. Use `PascalCase` for React components and classes, `camelCase` for functions and variables, and `kebab-case` for routes and assets. Frontend imports may use the `@/*` alias. Run lint and type checking before submitting changes.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. New feature work should introduce tests with the selected framework. Name TypeScript tests `*.test.ts` or `*.test.tsx`; place integration tests in `tests/integration/`. Test authentication boundaries, validation, conversation membership, message persistence, and failure states. Until test scripts exist, lint, type-check, build, and manually exercise affected HTTP or UI flows.

## Commit & Pull Request Guidelines

Usable Git history is unavailable, so follow Conventional Commits: `feat(back): add login endpoint`, `fix(front): handle failed search`. Keep commits focused. Pull requests must summarize behavior, list verification commands, link relevant issues, and include screenshots for UI changes. Highlight API, schema, or environment-variable changes.

## Task Workflow & Security

Read `docs/rules.md` before implementation. Work only from `docs/current-task.md`; update `docs/feature.md` and `docs/done.md` after verified completion. Never commit secrets, JWTs, passwords, production data, or chat transcripts. Validate input and authorization on the server, use parameterized SQLite queries, and expose only `NEXT_PUBLIC_*` frontend variables.
