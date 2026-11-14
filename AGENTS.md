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

## Performance checks

`packages/hotkeys/bench/` holds [Heisenbench](https://www.npmjs.com/package/heisenbench)
benches for the core. Heisenbench counts the work each function does (steps), and the
count is the same on every run. The Heisenbench workflow posts the PR's step changes as a
PR comment.

- Heisenbench needs Node 26.4 or newer. Run `pnpm bench` from the root on that Node.
- After you change `packages/hotkeys/src`, compare the counts before and after the
  change. In `packages/hotkeys`, run these commands. `--source-from HEAD` counts the
  committed code from git and does not change the working tree.

  ```bash
  pnpm bench --source-from HEAD --out "${TMPDIR:-/tmp}/before.json"
  pnpm bench --out "${TMPDIR:-/tmp}/after.json"
  pnpm bench:diff "${TMPDIR:-/tmp}/before.json" "${TMPDIR:-/tmp}/after.json"
  ```

- In the diff or the PR comment, explain or fix each of these:
  - Steps changed in a function that the change did not touch.
  - Steps grew by more than a few percent in a case that the change was not meant to
    affect.
  - Steps grew by much more than the changed lines explain.
  - A bench file is listed under "Did not run".
- Steps are not time. Do not claim a speedup or a slowdown from steps alone.
- When you add a hot path, such as work on every key press or registration, add a case
  to the bench files.

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
