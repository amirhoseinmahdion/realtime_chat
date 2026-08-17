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

## 2026-08-17 — Enhancement: RTL Authentication Layout Completion

**Status:** Complete

### Delivered

- Made the top preference controls direction-aware: top-right in English and top-left in Persian, avoiding the RTL authentication brand.
- Translated the respectful-conversation footer, chat-preview accessibility label, presence, messages, delivery status, and composer hint.
- Replaced remaining physical alignment utilities in the authentication preview with logical RTL-aware equivalents.

### Verified

- Frontend lint and strict TypeScript checks passed.
- All 13 frontend tests passed.
- Vercel production build passed and deployment `dpl_HDdDZmYgdyecrcApz9zGjkAdLGH1` is Ready.
- The production login alias returned HTTP 200 with a fresh deployment cache.

### Notes

- Commit `3add35e` remains local until GitHub authentication is configured; the exact committed frontend was deployed directly to Vercel.

## 2026-08-17 — Enhancement: Preference Control Location and Persian Error Fallback

**Status:** Complete

### Delivered

- Moved the global theme and language controls together from the bottom-right to the top-right.
- Added a Persian fallback so unknown authentication failures cannot expose English feedback while Persian is selected.
- Published the corrected frontend directly to the Vercel production alias.

### Verified

- Frontend lint and strict TypeScript checks passed.
- All 12 frontend tests passed.
- Vercel production build passed and deployment `dpl_4prNPbCdAnProsDh8zkaSspG6Ra4` is Ready.
- `https://front-self-tau.vercel.app/login` returned HTTP 200 from the fresh production deployment.

### Notes

- Commit `e972201` could not be pushed from this terminal because GitHub HTTPS credentials are unavailable; Vercel received the exact local committed frontend directly.

## 2026-08-17 — Enhancement: Theme, Language, and Localized Authentication Errors

**Status:** Complete

### Delivered

- Confirmed that the global persisted theme and language controls are rendered on authentication and application pages.
- Localized login/signup client validation, known API/network feedback, input hints, and session-loading accessibility text in Persian.
- Made visible authentication feedback react immediately when the selected language changes.
- Added focused unit coverage for Persian client-validation and authentication API translations.

### Verified

- `npm run lint` — passed in `front/`.
- `npm run typecheck` — passed in `front/`.
- `npm test` — all 11 tests passed in `front/`.
- `npm run build` — reached Next.js production optimization but remained hung until stopped, matching the existing documented environment limitation.

### Notes

- Unknown server messages fall back to their original text; all currently known login/signup errors are translated.

## 2026-08-16 — Enhancement: Free Hosted Test Environment

**Status:** Complete

### Delivered

- Deployed the Next.js client to `https://front-self-tau.vercel.app` and the Express/Socket.IO API to `https://online-chat-api-amirhosein.onrender.com`.
- Added a Render Blueprint with generated secrets, exact-origin CORS, a health check, and explicit ephemeral SQLite configuration.
- Linked the production client to the hosted HTTP API and Socket.IO endpoint without committing credentials.

### Verified

- Backend lint, strict TypeScript, 20 integration tests, and production build passed.
- Frontend lint, strict TypeScript, eight tests, and the Vercel production build passed.
- Hosted health, OpenAPI, browser rendering, two-user signup, direct conversation creation, WebSocket room joins, message acknowledgement, broadcast, and persisted history passed.

### Notes

- Render Free can sleep after inactivity and erase the local SQLite database after sleep, restart, or redeployment. This environment is for testing only.
- The local deployment commit could not be pushed because GitHub HTTPS and SSH authentication are not configured on this machine.

## 2026-08-16 — Feature 8: Quality, Security, and Release Readiness

**Status:** Complete

### Delivered

- Added strict environment validation, defensive HTTP headers, request IDs, structured JSON request/error logs, and safe malformed-body responses.
- Added dependency-free IP throttling for authentication and search plus per-user Socket.IO message throttling, with retry metadata and documented Swagger responses.
- Normalized client network failures and added a visible chat recovery action; improved dialog focus and completed a React accessibility/quality review.
- Expanded contributor documentation for setup, automatic SQLite initialization, verification, production configuration, and known build constraints.

### Verified

- Backend lint, strict TypeScript, production build, 20 integration tests, and production dependency audit passed with zero known vulnerabilities.
- Frontend lint, strict TypeScript, eight Vitest tests, and production dependency audit passed with zero known vulnerabilities.
- Integration tests exercise authentication, conversations, messaging, profiles, invalidated sessions, configuration, headers, safe errors, and all new rate limits.

### Notes

- Visual browser automation remains unavailable because `agent-browser` is not installed.
- The Next.js production build remains blocked by the documented sandbox/Turbopack and webpack fallback issues; development compilation and standalone frontend checks pass.

## 2026-08-16 — Feature 7: Profile and Account Management

**Status:** Complete

### Delivered

- Added authenticated profile read/update APIs with strict username, display-name, biography, and HTTP(S) avatar validation, normalized uniqueness, Swagger contracts, and replacement JWT issuance.
- Added a responsive, centered profile dialog with editing feedback, immediate auth/chat refresh, local image selection and preview, sidebar logout, and exact-phrase destructive confirmation.
- Added transaction-safe account anonymization that invalidates credentials, prevents future login and discovery, and retains message/conversation structure under a deleted-user identity.
- Revalidated JWTs on protected Socket.IO events so rotated or deleted credentials cannot keep sending messages.

### Verified

- Backend lint, strict TypeScript, production build, and 14 integration tests passed.
- Frontend lint, strict TypeScript, and six Vitest tests passed.
- API tests covered profile reads/updates, validation, conflicts, token rotation, confirmation, anonymized history, login prevention, and invalidated live sockets.

### Notes

- Visual browser automation remains unavailable because `agent-browser` is not installed. The existing Next.js production-build environment limitation remains unchanged.

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
