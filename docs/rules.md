# Development Rules

## Required Workflow

Follow this process for every development session. Do not start unrelated work or skip directly to a future feature.

### 1. Read the Project Context

Before changing code, read:

1. `AGENTS.md`
2. `docs/project.md`
3. `docs/architecture.md`
4. `docs/stack.md`
5. `docs/feature.md`
6. `docs/current-task.md`
7. `docs/done.md`

These files define the project requirements, architecture, technologies, and active work.

### 2. Complete the Current Task

Treat `docs/current-task.md` as the only active implementation plan.

- Work through its steps in order.
- Mark a step complete only after implementing and verifying it.
- Run the relevant type checks, linting, and tests after each meaningful change.
- Record blockers or important decisions in the current task file.
- Do not begin the next feature while required current-task steps remain incomplete.

Use this checklist format:

```md
- [ ] Pending step
- [x] Completed and verified step
```

### 3. Read the Feature Backlog

After the current task is complete, add a dated entry to `docs/done.md` describing what was delivered and how it was verified. Then read `docs/feature.md`, which contains upcoming features in priority order. Select the first incomplete feature unless it depends on unfinished work.

Do not implement directly from the feature backlog. First convert the selected feature into a small, testable plan.

### 4. Create the Next Current Task

Replace the completed contents of `docs/current-task.md` with the selected feature and its implementation steps. Each step must describe one verifiable outcome.

```md
# Current Task: User Search

## Goal

Allow authenticated users to search for other users by username.

## Steps

- [ ] Add the protected backend search endpoint.
- [ ] Add parameterized username search to the database layer.
- [ ] Add the frontend search input and result list.
- [ ] Add loading, empty, and error states.
- [ ] Test authorization, matching, and UI behavior.

## Completion Criteria

- Search works end to end and all checks pass.
```

Mark the finished feature **Complete** and the selected feature **Active** in `docs/feature.md`. Then begin again from step 1 of this workflow.

## Change and Verification Rules

- Keep frontend work inside `front/` and backend work inside `back/`.
- Follow the contracts and boundaries documented in `docs/architecture.md`.
- Use only the technologies approved in `docs/stack.md` unless the documentation is updated first.
- Never mark work complete without verification.
- Update documentation whenever behavior, configuration, API contracts, or setup commands change.
- Keep one active feature in `docs/current-task.md`; future work belongs in `docs/feature.md`.
- Keep verified completion history in `docs/done.md`; do not use it for planned or partially completed work.

## File Naming

Use `docs/feature.md` (not `feture.md`) for the backlog, `docs/current-task.md` for the active plan, and `docs/done.md` for completed work.
