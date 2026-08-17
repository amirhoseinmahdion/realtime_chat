# Current Task: Hosted Authentication Connectivity

**Status:** Complete

## Goal

Restore signup/login connectivity from the Vercel frontend to the hosted Render API.

## Steps

- [x] Reproduce and inspect the hosted CORS preflight.
- [x] Verify the Render API allows the exact production frontend origin.
- [x] Identify the frontend production endpoint configuration failure.
- [x] Configure production HTTP API and Socket.IO URLs in Vercel.
- [x] Rebuild, deploy, and verify the signup request path.

## Completion Criteria

The production signup page calls the hosted Render API, and browser-style preflight and POST requests return the correct CORS origin.

## Notes and Blockers

- Vercel deployment `dpl_6AvRMDcSniV4Gd3aaLDSgMiSJYNp` is Ready and assigned to the production alias.
- Render Free may take approximately 30 seconds to wake after inactivity.
