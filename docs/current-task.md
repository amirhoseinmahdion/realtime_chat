# Current Task: Preference Control Location and Persian Form Errors

**Status:** Complete

## Goal

Move the theme and language controls to the top-right of every page and guarantee Persian login/signup error feedback when Persian is selected.

## Steps

- [x] Move the theme and language controls from the bottom-right to the top-right.
- [x] Use a Persian fallback for unknown authentication errors in Persian mode.
- [x] Add automated coverage for the Persian fallback.
- [x] Run frontend lint, strict type checking, tests, and production build.
- [x] Commit, deploy, and verify the hosted login page.

## Completion Criteria

Theme and language controls appear together at the top-right, and login/signup never show English error feedback while Persian is active.

## Notes and Blockers

- GitHub push remains unavailable in this terminal because HTTPS credentials are not configured; commit `e972201` is local.
- Vercel production deployment `dpl_4prNPbCdAnProsDh8zkaSspG6Ra4` completed successfully and was assigned to `https://front-self-tau.vercel.app`.
