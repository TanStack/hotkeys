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

<!-- intent-maintainer:start -->

## Library Skill Maintenance

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before substantial library source, documentation, examples, tests, or skill work, run `pnpm exec intent meta generate-skill` and follow the packaged maintainer procedure.
Use the current request and repository evidence. For initial skills, propose a useful batch and reuse any scope already agreed with the maintainer.
Before handing off a skill batch or library change, run `pnpm exec intent maintainer review --json`. Follow the maintainer procedure to update affected guidance, run task checks, and record completed review outcomes. Report an evidence-backed no-op or missing evidence explicitly.
Create and incrementally maintain domain_map.yaml, skill_spec.md, and skill_tree.yaml in the established artifact location for every skill batch. Preserve prior tasks, maintainer decisions, and remaining work.
Keep maintainer decisions and changes in the repository; do not require the user to repeat the procedure in later sessions.
Use intent maintainer setup to initialize missing records, maintainer add to register skills, maintainer status to identify work, and maintainer sync to update generated metadata. Finish with intent maintainer check.
<!-- intent-maintainer:end -->
