# Technology Stack

## Frontend

The frontend lives in `front/` and runs on `http://localhost:3000`.

- **Next.js:** App Router for routing, layouts, and pages.
- **TypeScript:** strict mode enabled with `"strict": true` in `tsconfig.json`.
- **Tailwind CSS:** utility-first styling and responsive layouts.
- **Socket.IO Client:** persistent real-time connection to the chat server.

Browser API requests and Socket.IO connections must use environment variables rather than hard-coded server URLs.

```env
# front/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Only variables prefixed with `NEXT_PUBLIC_` may be exposed to browser code. Never place secrets in frontend environment files.

## Backend

The backend lives in `back/` and runs on `http://localhost:4000`.

- **Express:** HTTP API, middleware, and route handling.
- **Socket.IO:** real-time messages, typing events, presence, and read receipts.
- **better-sqlite3:** synchronous SQLite database access and local persistence.
- **jsonwebtoken:** creation and verification of authentication tokens.
- **bcryptjs:** password hashing and verification.
- **cors:** access control for the frontend origin.
- **TypeScript:** strict type checking for all server code.
- **tsx:** TypeScript execution and watch mode during development.

Use environment variables for ports, origins, tokens, and database locations:

```env
# back/.env
PORT=4000
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_PATH=./data/chat.db
```

Commit a sanitized `back/.env.example`, but never commit `back/.env`, JWT secrets, or database files containing user data.

## Expected Package Scripts

Frontend scripts in `front/package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

Backend scripts in `back/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  }
}
```

The backend reads `PORT` from `.env` and defaults to `4000`. Next.js uses port `3000`.

## Local Development

Install and run each application in a separate terminal:

```bash
cd front
npm install
npm run dev
```

```bash
cd back
npm install
npm run dev
```

Configure Express CORS and Socket.IO CORS with `CLIENT_URL`. Authentication should use JWTs in secure HTTP-only cookies when possible. If the token is sent in a Socket.IO handshake, verify it before allowing the socket to join user or conversation rooms.

## Database

Store the SQLite file under `back/data/` and ignore `*.db`, `*.db-shm`, and `*.db-wal`. Enable foreign keys and WAL mode when initializing `better-sqlite3`:

```ts
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
```

Use parameterized statements for every query. Database operations and JWT/password logic must remain on the backend.
