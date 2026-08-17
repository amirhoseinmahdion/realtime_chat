# Online Chat

A real-time chat application with a Next.js client and an Express/Socket.IO server. The interface supports persistent English and Persian preferences with automatic LTR/RTL layout. Profile avatars accept validated PNG, JPEG, WebP, or GIF images up to 2 MB.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Setup

Create local environment files from the committed examples:

```bash
cp front/.env.example front/.env.local
cp back/.env.example back/.env
```

Install dependencies:

```bash
cd front && npm install
cd ../back && npm install
```

Edit `back/.env` before starting. `JWT_SECRET` must contain at least 32 characters; `CLIENT_URL` must be the exact HTTP(S) client origin. The server validates configuration at startup and exits on invalid values.

SQLite initializes automatically on first server start. The default database is `back/data/chat.db`; schema migrations are repeatable and preserve existing data. Never commit `.env` files or database files.

## Development

Run each application in a separate terminal:

```bash
cd front
npm run dev
```

```bash
cd back
npm run dev
```

The client runs at `http://localhost:3000`. The API and Socket.IO server run at `http://localhost:4000`; health is available at `GET /api/health`. Interactive Swagger documentation is available at `http://localhost:4000/api/docs` and its OpenAPI JSON at `GET /api/docs.json`.

## Verification

Run these commands inside both `front/` and `back/`:

```bash
npm run lint       # code-quality checks
npm run typecheck  # strict TypeScript validation
npm test           # Vitest client tests or Node backend integration tests
npm run build      # production compilation
npm audit --omit=dev
```

Backend tests use isolated in-memory databases and temporary local Socket.IO servers. The API protects authentication and search with IP rate limits, limits message creation per user, returns request IDs, and emits structured JSON request logs without request bodies or authorization headers.

## Production

Build each application, then run `npm start` in separate processes. Set `CLIENT_URL` to the deployed client origin, use a unique high-entropy `JWT_SECRET`, and store `DATABASE_PATH` on persistent storage with restricted permissions. Terminate TLS at a trusted reverse proxy and forward only one trusted proxy hop.

The current sandbox cannot complete the frontend Next.js production build because Turbopack is denied an internal worker port; its webpack fallback has a Next.js 16.3.1 TypeScript configuration parsing issue. Frontend development compilation, ESLint, strict TypeScript, and Vitest remain the available checks in this environment.

Project requirements and workflow are documented in `docs/`.
