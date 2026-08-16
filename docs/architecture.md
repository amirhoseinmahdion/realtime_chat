# Full-Stack Chat Architecture

## Overview

The application is split into two independent TypeScript projects:

- `front/`: Next.js App Router, TypeScript, and Tailwind CSS.
- `back/`: Express, Socket.IO, TypeScript, and a relational database.

HTTP handles authentication, profiles, search, conversation queries, and message history. Socket.IO handles live messages, typing indicators, presence, and read receipts. The backend is the only layer allowed to access the database.

## Recommended Project Structure

```text
fullstack-chats/
├── docs/
│   └── architecture.md
├── front/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/register/page.tsx
│   │   │   ├── chat/[conversationId]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── socket.ts
│   │   ├── providers/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.ts
├── back/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── conversations/
│   │   │   └── messages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   │   ├── handlers/
│   │   │   └── index.ts
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
└── AGENTS.md
```

## Core Domain Model

- **User**: id, email, username, password hash, display name, avatar, bio, status, timestamps.
- **Conversation**: id, type (`direct` or `group`), title, creator, timestamps.
- **ConversationMember**: conversation id, user id, role, joined time, last-read message.
- **Message**: id, conversation id, sender id, content, type, edited/deleted timestamps, created time.

Add a unique constraint for direct-conversation participants to prevent duplicate chats. Index usernames for search and index messages by `(conversationId, createdAt)` for paginated history.

## HTTP API Responsibilities

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/users/search?q=
GET    /api/users/:userId
PATCH  /api/users/me
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:id/messages?cursor=&limit=
```

Controllers validate input and call services. Services enforce authorization and implement business rules. Repositories or ORM queries perform persistence. Every conversation and message query must verify membership.

## Real-Time Flow

Authenticate the Socket.IO handshake using the same session or access token as HTTP. After connecting, join a private room named `user:{userId}`. When a conversation opens, join `conversation:{conversationId}` only after checking membership.

Recommended events:

- Client: `conversation:join`, `message:send`, `typing:start`, `typing:stop`, `message:read`.
- Server: `message:created`, `message:updated`, `typing:changed`, `presence:changed`, `message:read`.

Persist and validate a message before broadcasting it. Use an acknowledgement callback so the client can replace an optimistic message with the saved message ID.

## Authentication and Security

Hash passwords with Argon2 or bcrypt. Prefer secure, HTTP-only cookies for credentials; enable `Secure` in production and configure CORS for the exact frontend origin. Validate request bodies, rate-limit authentication and search endpoints, escape or sanitize user content, and never trust user IDs supplied by the client. Keep secrets in `back/.env` and publish only placeholders in `.env.example`.

The current browser client stores the short-lived Bearer JWT under the versioned local-storage key `fullstack-chat:auth-token:v1`. This supports the present JSON token contract but remains accessible to injected JavaScript. Before production, move authentication to `Secure`, `HttpOnly`, `SameSite` cookies and add the corresponding CSRF controls.

## Message History and Pagination

Use cursor pagination rather than page numbers. Fetch messages older than a supplied message timestamp or ID, newest first at the database layer, then render them chronologically. The frontend should cache conversations, deduplicate messages by ID, reconnect the socket automatically, and refetch missed messages after reconnection.
