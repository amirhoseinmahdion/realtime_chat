# Current Task: Feature 7 — Profile and Account Management

**Status:** Active

## Goal

Allow authenticated users to view and edit their profile, log out, and permanently delete their account with clear confirmation and safe history handling.

## Backend

- [ ] Add authenticated profile read and update endpoints.
- [ ] Validate display name, username, biography, and avatar URL.
- [ ] Enforce normalized username uniqueness.
- [ ] Add confirmed account deletion with transaction-safe message anonymization.
- [ ] Invalidate all credentials after profile-sensitive changes and deletion.
- [ ] Document profile and deletion contracts in Swagger.

## Frontend

- [ ] Add an accessible profile panel reachable from the chat sidebar.
- [ ] Support editing profile fields with validation, loading, success, and error states.
- [ ] Reflect saved profile data in the auth state and chat UI immediately.
- [ ] Keep logout available and clearly separate it from destructive deletion.
- [ ] Require explicit account-deletion confirmation and return to signup afterward.

## Verification

- [ ] Add backend tests for validation, conflicts, authorization, updates, anonymization, and deletion.
- [ ] Add frontend tests for editing, errors, logout, and confirmation states.
- [ ] Run client/server lint, strict type checks, tests, builds where supported, and audits.
- [ ] Verify profile update and account deletion flows end to end.

## Completion Criteria

Feature 7 is complete when users can safely maintain their public profile, end their session, or delete their account without breaking retained conversation history.

## Notes and Blockers

- Historical messages should retain conversation structure while replacing deleted-user identity with an anonymous representation.
