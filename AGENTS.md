# AGENTS.md

This file defines the default working rules for agents in this repository.

## Scope

- Applies to the entire repository rooted at `.`.

## Working Rules

- Read the relevant code paths before proposing or making changes.
- Prefer minimal, targeted edits over broad refactors unless the task explicitly calls for structural change.
- Preserve existing behavior unless the requested change is supposed to alter it.
- Keep documentation aligned with implementation when setup, architecture, data flow, or major UI behavior changes.

## Repo-Specific Truths

- This repository is an Expo / React Native frontend application.
- The backend host is configured in `src/config/api.ts`.
- React Query is the default mechanism for server-state management.
- `src/context/ExplorerParamsContext.tsx` is only for shared analyst query parameters, not a general-purpose app store.
- Live transaction synchronization is implemented in `src/features/transactions/LiveTransactionSync.tsx`.

## Required Validation

After code changes, run at minimum:

```bash
yarn typecheck
yarn test
```

## Documentation Rule

- When a change affects setup, data flow, architecture assumptions, or major UI behavior, update `README.md` in the same change.

## Completion Rule

- Do not claim a task is complete if required validation is failing.
- If validation fails because of the environment rather than the code, report the exact command and blocker clearly.

## Exclusions

- Do not turn this file into a giant style guide.
- Do not restate generic React or TypeScript best practices that are not specific to this repo.
- Do not add one-off task checklists that will rot after a single change.
- Do not add fake process theater.
