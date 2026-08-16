# Current Task: Feature 6 — Real-Time Messaging

**Status:** Active

## Goal

Enable authenticated, persisted real-time messaging through Socket.IO. Users must receive new messages without refreshing, recover missed history after reconnecting, and see reliable optimistic delivery state.

## Server Socket Layer

- [ ] Authenticate Socket.IO handshakes using the existing JWT and token-version checks.
- [ ] Join each connection to `user:{userId}` and authorized `conversation:{conversationId}` rooms.
- [ ] Add validated `conversation:join` and `message:send` events with acknowledgement payloads.
- [ ] Verify membership before joining rooms or creating messages.
- [ ] Persist each message transactionally before broadcasting `message:created`.
- [ ] Update conversation activity when a message is created.
- [ ] Add safe socket error codes without leaking conversation membership.

## Client Messaging

- [ ] Add one authenticated Socket.IO client lifecycle tied to the active session.
- [ ] Join the selected conversation and clean up listeners when selection changes.
- [ ] Enable the composer with validation, keyboard submission, and disabled/loading states.
- [ ] Add optimistic messages with client IDs and reconcile them from acknowledgements.
- [ ] Deduplicate broadcast, acknowledgement, and history messages by server ID.
- [ ] Display failed sends with an accessible retry action.
- [ ] Refetch recent history after reconnection to recover missed messages.

## Presence Enhancements

- [ ] Add typing start/stop events after core message delivery is stable.
- [ ] Add basic online presence for direct-conversation participants.
- [ ] Add read receipts only after delivery and reconnection tests pass.

## Verification

- [ ] Add server integration tests for authentication, membership, persistence, broadcast, and acknowledgements.
- [ ] Add client tests for optimistic reconciliation, duplicate prevention, failures, and reconnect recovery.
- [ ] Run frontend and backend lint, strict type checks, tests, builds where supported, and production audits.
- [ ] Verify a two-user message flow and reconnect recovery against live servers.

## Completion Criteria

Feature 6 is complete when two authenticated members can exchange persisted messages in real time, optimistic messages reconcile reliably, unauthorized access is rejected, and reconnecting clients recover missed content.

## Notes and Blockers

- Feature 5 already provides the conversation selection, history, and composer shell required for this phase.
- Browser automation remains unavailable unless `agent-browser` is installed.
