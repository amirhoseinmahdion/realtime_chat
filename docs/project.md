# Real-Time Chat Project

## Project Summary

This project is a full-stack, real-time chat application. A user enters their username to access an existing account. After successful authentication, the user is redirected to the chat page, where they can find other users, start conversations, and exchange messages instantly.

The application uses Next.js App Router, TypeScript, and Tailwind CSS on the frontend. The backend uses Express, Socket.IO, and TypeScript. See [architecture.md](./architecture.md) for the technical structure.

## User Journey

1. The user opens the login page and enters a username.
2. The system checks whether the account exists and verifies the user's credentials.
3. After authentication, the system redirects the user to the chat page.
4. The user searches for another user by username or display name.
5. The user selects a result to open an existing conversation or create a new one.
6. Both users send and receive messages in real time.
7. The user may update their profile, log out, or permanently delete their account.

If username-only login is retained for a demonstration project, it must not be used in production. A production version must also verify a password, one-time code, or trusted identity provider.

## Core Features

### Authentication

- Log in to an existing account.
- Keep the user signed in across page refreshes.
- Redirect unauthenticated visitors to the login page.
- Log out and invalidate the active session.

### User Search and Conversations

- Search users by username or display name.
- Exclude the current user from results.
- Open an existing direct conversation instead of creating duplicates.
- Display a conversation list ordered by the latest message.

### Real-Time Messaging

- Send and receive messages without refreshing the page.
- Display message timestamps, delivery state, and loading/error feedback.
- Load earlier message history using pagination.
- Restore missed messages after reconnecting.

### Profile and Account

- View and edit username, display name, biography, and avatar.
- Validate username uniqueness before saving.
- Log out from the profile or navigation menu.
- Delete the account only after explicit confirmation.

## Main Screens

- **Login:** username and credential entry, validation, and error feedback.
- **Chat:** conversation sidebar, user search, message history, and composer.
- **Profile:** account details, editable profile fields, logout, and account deletion.

The chat layout should work on desktop and mobile. On small screens, the conversation list and active conversation may appear as separate views.

## Account Deletion Rules

Account deletion is destructive and must require confirmation. The backend must verify the current user before performing it. The product must define whether previous messages are anonymized or deleted; anonymization is preferred when messages are needed to preserve conversation history. After deletion, invalidate all sessions and return the user to the login page.

## Acceptance Criteria

- An authenticated user can search for another account and start a direct chat.
- Messages appear for both participants in real time and remain available after refresh.
- Unauthorized users cannot access profiles, conversations, or message history.
- Users can update their profile and see the changes reflected in search and chat views.
- Logging out invalidates the session and protects private routes.
- Deleting an account requires confirmation and prevents future login.
