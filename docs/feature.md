# Feature Backlog

Features are implemented in order. Only one feature may be marked **Active** at a time. Before implementation, copy the selected feature into `docs/current-task.md` and expand it into verifiable steps as described in `docs/rules.md`.

Status values: **Planned**, **Active**, **Complete**, or **Blocked**.

## Feature 1: Project Foundation

**Status:** Complete

Create runnable frontend and backend applications.

- Initialize `front/` with Next.js App Router, strict TypeScript, and Tailwind CSS.
- Initialize `back/` with Express, Socket.IO, strict TypeScript, and `tsx`.
- Add environment examples for client port `3000` and server port `4000`.
- Configure linting, type checking, build scripts, CORS, and `.gitignore` rules.
- Add a backend health endpoint and confirm both applications run locally.

## Feature 2: Backend Authentication

**Status:** Complete

Create secure signup, login, session validation, and logout behavior.

- Initialize SQLite with `better-sqlite3` and create the users table.
- Add validation and unique username handling.
- Hash passwords with `bcryptjs`.
- Issue and verify JWT credentials using protected middleware.
- Add signup, login, current-user, and logout endpoints.
- Add tests for valid, invalid, duplicate, and unauthorized requests.

## Feature 3: Authentication UI

**Status:** Complete

Build the public authentication experience and connect it to the server.

- Create shared login and signup layouts and forms.
- Add field validation, loading states, and server error feedback.
- Connect forms to the authentication API.
- Restore the authenticated user when the app loads.
- Redirect successful login or signup to `/chat`.
- Protect chat routes from unauthenticated access.

## Feature 4: User and Conversation APIs

**Status:** Complete

Provide the server APIs needed by the chat interface.

- Search users by username or display name, excluding the current user.
- Create or reuse a direct conversation between two users.
- List the current user's conversations ordered by recent activity.
- Return paginated message history for a conversation.
- Verify conversation membership on every protected operation.
- Add indexes and parameterized queries for search and history.

## Feature 5: Chat and Conversation UI

**Status:** Complete

Create the authenticated chat page and connect it to server APIs.

- Build responsive conversation sidebar and active-chat layouts.
- Add user search with loading, empty, and error states.
- Start a chat from a search result without creating duplicates.
- Display conversations and paginated message history.
- Add a message composer and optimistic sending state.
- Support mobile navigation between the list and active conversation.

## Feature 6: Real-Time Messaging

**Status:** Complete

Deliver live chat through Socket.IO.

- Authenticate Socket.IO connections with the user's JWT.
- Join authorized user and conversation rooms.
- Persist messages before broadcasting them.
- Send and receive new messages without refreshing.
- Add acknowledgements, reconnection, deduplication, and missed-message recovery.
- Add typing indicators, online presence, and read receipts after core delivery works.

## Feature 7: Profile and Account Management

**Status:** Complete

Allow users to manage their identity and session.

- View and edit username, display name, biography, and avatar.
- Enforce validation and username uniqueness on the server.
- Reflect profile changes in search and conversations.
- Log out and invalidate the active credential.
- Delete an account after explicit confirmation.
- Anonymize historical messages and invalidate all sessions after deletion.

## Feature 8: Quality, Security, and Release Readiness

**Status:** Complete

Prepare the application for reliable use.

- Add backend integration tests and frontend component/flow tests.
- Rate-limit authentication, search, and message creation.
- Add centralized error handling, structured logs, and safe error responses.
- Validate environment variables during startup.
- Add accessible labels, keyboard behavior, and responsive UI checks.
- Document setup, database initialization, testing, and production build commands.

## Future Enhancements

Consider these only after Features 1–8 are complete:

- Group conversations and member roles.
- Message editing, deletion, reactions, and file attachments.
- Conversation unread counts and notification preferences.
- User blocking and abuse reporting.
- Password reset and multi-device session management.

## Enhancement: Free Hosted Test Environment

**Status:** Complete

Deploy the client to Vercel and the Express/Socket.IO service to Render for temporary public testing. Retain SQLite only with an explicit ephemeral-data warning; migrate to hosted PostgreSQL before production use.

## Enhancement: Theme, Language, and Localized Authentication Errors

**Status:** Complete

Keep theme and language controls available throughout the app and localize login/signup validation and server feedback when Persian is selected.

## Enhancement: Preference Control Location and Persian Error Fallback

**Status:** Complete

Place the theme and language controls together at the top-right and prevent unknown English authentication errors from appearing in Persian mode.

## Enhancement: RTL Authentication Layout Completion

**Status:** Active

Use direction-aware preference positioning and translate all remaining supporting copy on the Persian authentication pages.
