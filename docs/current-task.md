# Current Task: Theme, Language, and Localized Authentication Errors

**Status:** Complete

## Goal

Let users change the page theme and language, and ensure login and signup feedback is shown in Persian when Persian is selected.

## Steps

- [x] Confirm the global theme and language controls work on authentication pages.
- [x] Translate client validation, API, and fallback authentication errors into Persian.
- [x] Translate authentication input hints and loading accessibility text.
- [x] Add automated coverage for Persian authentication translations.
- [x] Run frontend lint, strict type checking, tests, and production build.

## Completion Criteria

Theme and language preferences remain available across pages, and login/signup never show known English validation or API errors while Persian is active.

## Notes and Blockers

- Frontend lint, strict type checking, and all 11 tests passed.
- The production build was attempted and reached Next.js optimization, but remained hung there until stopped. This is the existing environment limitation already recorded in `docs/done.md`; no compilation error was emitted.
