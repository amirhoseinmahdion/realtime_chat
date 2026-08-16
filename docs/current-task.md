# Current Task: Feature 5 — Chat and Conversation UI

**Status:** Active

## Goal

Replace the chat placeholder with a responsive product interface connected to the Feature 4 APIs. Users must be able to search for people, start or reopen direct chats, browse conversations, and load paginated history.

## Client Data Layer

- [ ] Add typed user-search, conversation, and message models.
- [ ] Expose the active Bearer token safely through the auth client API.
- [ ] Add API functions for search, create/reuse conversation, list conversations, and history.
- [ ] Deduplicate conversations and messages by ID.
- [ ] Handle unauthorized responses by clearing the session and returning to login.

## Responsive Chat Layout

- [ ] Build the desktop conversation sidebar, active conversation header, history area, and composer.
- [ ] Add mobile navigation between conversation list and active conversation.
- [ ] Add accessible empty, loading, skeleton, and error states.
- [ ] Display conversation participants, latest-message previews, timestamps, and selected state.
- [ ] Keep the existing profile/logout access visible.

## Search and History Flows

- [ ] Add debounced user search with clear and empty-result states.
- [ ] Create or reuse a conversation from a search result and select it.
- [ ] Load the conversation list after authentication.
- [ ] Load recent history when selecting a conversation.
- [ ] Add a control for loading older messages using `nextCursor`.
- [ ] Add an optimistic composer shell; disable actual sends until Feature 6 supplies message creation.

## Verification

- [ ] Add frontend tests for data transformations and primary interaction states.
- [ ] Run frontend ESLint and strict type checking.
- [ ] Verify search, conversation selection, history, responsive navigation, logout, and error states.
- [ ] Run the production build or preserve the known environment limitation with standalone checks.

## Completion Criteria

Feature 5 is complete when authenticated users can discover people, open direct conversations, navigate their conversation list, and browse paginated history on desktop and mobile. Message sending becomes active in Feature 6.

## Notes and Blockers

- The Feature 4 backend intentionally has no HTTP message-creation endpoint; the composer remains a disabled preview until real-time persistence is implemented in Feature 6.
- Visual automation remains unavailable unless `agent-browser` is installed.
