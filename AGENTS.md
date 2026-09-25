# Agent Instructions

Before analyzing or changing this repository, read and follow
[`CONTRIBUTING.md`](./CONTRIBUTING.md). Its contribution, development, testing,
pull request, and changeset requirements apply to AI-assisted work as well as
human-authored work.

Keep every change focused on one topic. Understand and verify all generated
code, run the required checks, and provide a concise pull request description
that follows the repository template.

## Dependency compatibility pins

- Keep TypeScript at `6.0.3` during routine dependency updates.
- Keep `@tanstack/preact-store` at `0.13.3` or newer. Versions `0.13.1` and
  `0.13.2` leave `useHotkeyHint` stale when its binding changes without a store
  update; `0.13.3` fixes this in TanStack/store#367. Verify
  `packages/preact-hotkeys/tests/useHotkeyHint.test.tsx` before upgrading.
