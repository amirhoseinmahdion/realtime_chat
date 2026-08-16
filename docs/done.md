# Completed Work

This file records project phases that have been implemented and verified. Planned work remains in `docs/feature.md`; active work belongs in `docs/current-task.md`.

## Completion Rules

- Add an entry only after every completion criterion in the current task passes.
- Include the completion date, delivered behavior, and exact verification performed.
- Record known limitations or follow-up work instead of hiding incomplete behavior.
- Keep entries in reverse chronological order, with the newest first.

## Entry Template

```md
## YYYY-MM-DD — Feature N: Feature Name

**Status:** Complete

### Delivered

- Short description of implemented behavior.
- Important files, routes, or configuration added.

### Verified

- `npm run typecheck` — passed in `front/` and/or `back/`.
- `npm run lint` — passed.
- `npm run build` — passed.
- Manual or automated behavior check — passed.

### Notes

- Known limitations or `None`.
```

## Completed Features

## 2026-08-16 — Feature 6: Real-Time Messaging

**Status:** Complete

### Delivered

- Added JWT-authenticated Socket.IO connections, private user/conversation rooms, membership enforcement, persistence-before-broadcast, and acknowledgements.
- Enabled optimistic sending, server reconciliation, failed-send retry, reconnect history recovery, and duplicate prevention.
- Added typing indicators, online presence, persisted read receipts, and message activity updates.
- Added real Socket.IO integration tests for authentication, authorized broadcast, persistence, and rejection.

### Verified

- Frontend lint, strict TypeScript, and three Vitest tests passed.
- Backend lint, strict TypeScript, ten integration tests, and production build passed.
- Production dependency installation/audits reported no known vulnerabilities.

### Notes

- Browser automation remains unavailable; live two-client delivery is covered through Socket.IO integration tests.

## 2026-08-16 — Feature 5: Chat and Conversation UI

**Status:** Complete

### Delivered

- Added a responsive chat shell with desktop sidebar and mobile list/detail navigation.
- Connected debounced user search, direct-chat creation, conversation listing, and cursor-paginated history to the authenticated API.
- Added session-expiry handling, ID-based deduplication, loading/empty/error states, participant details, previews, timestamps, logout, and a disabled Feature 6 composer.
- Added Vitest coverage for conversation and message merging/order behavior.

### Verified

- Frontend ESLint, strict TypeScript, two Vitest tests, and production dependency audit passed.
- Login and chat routes returned HTTP 200; backend health returned a successful response.

### Notes

- Visual browser automation remains unavailable because `agent-browser` is not installed. The known Next.js production-build environment limitation remains documented under Feature 1.
- Sending stays intentionally disabled until Feature 6 adds authenticated Socket.IO persistence.

## 2026-08-16 — Feature 4: User and Conversation APIs

**Status:** Complete

### Delivered

- Added indexed SQLite tables for conversations, memberships, canonical direct-chat pairs, and messages.
- Added authenticated user search, create-or-reuse direct conversation, conversation listing, and cursor-paginated history APIs.
- Enforced membership with non-leaking 404 responses and documented all endpoints in Swagger.
- Added integration coverage for search, duplicate prevention, listing, pagination, validation, and authorization.

### Verified

- Backend ESLint, strict TypeScript, eight total integration tests, production build, and production dependency audit passed.
- Live health and Swagger JSON checks exposed all Feature 4 routes.

### Notes

- Message history is returned chronologically per page; `nextCursor` retrieves the next older page.

## 2026-08-16 — Feature 3: Authentication UI

**Status:** Complete

### Delivered

- Added responsive login/signup layouts, accessible forms, validation states, and backend API integration.
- Added typed auth state, versioned browser session persistence, restoration, guarded routes, and logout.
- Added a protected chat placeholder and documented the local-storage security tradeoff.

### Verified

- Frontend ESLint and strict TypeScript checks passed.
- Login and signup routes returned HTTP 200 and the backend health check passed.

### Notes

- Advanced at the user's direction. Automated browser interaction and responsive screenshots remain unavailable because `agent-browser` is not installed; frontend production build retains the environment limitation recorded under Feature 1.
- Production authentication should migrate from local storage to secure HTTP-only cookies with CSRF protection.

## 2026-08-16 — Feature 2: Backend Authentication

**Status:** Complete

### Delivered

- Added SQLite initialization and repeatable user-schema migration with WAL, foreign keys, normalized unique usernames, and token-version invalidation.
- Added signup, login, current-user, and logout APIs with validation, bcrypt hashing, 15-minute JWTs, Bearer middleware, and safe centralized errors.
- Documented authentication schemas, Bearer security, requests, responses, and errors in Swagger.
- Added isolated in-memory authentication integration tests.

### Verified

- Backend lint, strict type checking, four integration tests, and production build passed.
- Live signup returned HTTP 201; Swagger JSON exposed all four authentication paths and `bearerAuth`.
- Backend production dependency audit reported zero known vulnerabilities.

### Notes

- Logout increments the user's token version, invalidating every JWT issued before that logout.

## 2026-08-16 — Feature 1: Project Foundation

**Status:** Complete

### Delivered

- Created runnable Next.js and Express/Socket.IO TypeScript applications on ports `3000` and `4000`.
- Added strict type checking, ESLint, Tailwind CSS, environment examples, CORS, health checks, repository ignores, and setup documentation.
- Added Swagger UI at `/api/docs` and OpenAPI JSON at `/api/docs.json`.

### Verified

- Frontend and backend installation, lint, and strict type checks passed.
- Backend build passed; both development servers returned HTTP 200.
- Health, CORS, Swagger UI, and OpenAPI JSON checks passed.
- Frontend and backend production dependency audits reported zero known vulnerabilities.

### Notes

- Advanced to Feature 2 at the user's direction. The frontend production build remains environment-limited: Turbopack cannot bind its internal worker under the sandbox, and the Next.js 16.3.1 Webpack fallback fails in its internal `tsc --showConfig` parser. Development runtime and standalone type verification pass.
- Visual browser automation was unavailable because the `agent-browser` executable is not installed; client content was verified over HTTP.
