# Current Task: Free Hosted Test Environment

**Status:** Complete

## Goal

Publish a temporary no-cost test environment with the Next.js client on Vercel and the Express/Socket.IO server on Render.

## Steps

- [x] Add repeatable hosting configuration for both applications.
- [x] Configure production environment validation and exact CORS origins.
- [x] Document that SQLite data is temporary on Render Free.
- [x] Run frontend and backend lint, type checks, tests, and builds.
- [x] Deploy the API and client with sanitized environment variables.
- [x] Smoke-test health, API documentation, authentication, chat, and Socket.IO.
- [x] Record deployed URLs and verified results without committing secrets.

## Completion Criteria

Both public URLs load, the browser can call the API and connect to Socket.IO, and an end-to-end chat test succeeds.

## Notes and Blockers

- Render Free uses an ephemeral filesystem. The hosted SQLite database can reset after sleep, restart, or deployment and is suitable only for testing.
- Durable hosting requires migrating the database to PostgreSQL before production use.
- Client: https://front-self-tau.vercel.app
- API: https://online-chat-api-amirhosein.onrender.com
