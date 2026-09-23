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
- Keep `@tanstack/preact-store` at exactly `0.13.0`. Versions `0.13.1` and
  `0.13.2` cache selector results across changed selector closures, leaving
  `useHotkeyHint` stale when its binding changes without a store update.
  Verify `packages/preact-hotkeys/tests/useHotkeyHint.test.tsx` before upgrading.
