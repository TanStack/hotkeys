---
title: Agent Skills (TanStack Intent)
id: agent-skills
description: "Use TanStack Intent to wire TanStack Hotkeys' bundled Agent Skills into Claude Code, Cursor, GitHub Copilot, Codex, and other AI coding assistants."
keywords:
  - tanstack hotkeys
  - tanstack intent
  - agent skills
  - claude code
  - cursor
  - github copilot
  - codex
  - ai coding agents
  - SKILL.md
  - AGENTS.md
---

AI coding agents, including Claude Code, Cursor, GitHub Copilot, and Codex, often fall back to hand-rolled `keydown` listeners, `isMac` platform checks, or custom shortcut registries instead of using TanStack Hotkeys APIs.

TanStack Hotkeys bundles [Agent Skills](#what-are-agent-skills) directly inside its npm packages so your agent reads version-matched library guidance automatically. Run one CLI command to wire them into your repository.

## What are Agent Skills?

Agent Skills are markdown documents (`SKILL.md`) shipped inside npm packages that tell coding agents which APIs to use, which patterns to avoid, and which edge cases already work out of the box. The format is an open standard supported across major coding agents.

Because the skills live inside your installed packages, they stay in sync whenever you run `npm update` or `pnpm update` instead of relying on stale training data.

## Skills shipped by TanStack Hotkeys

The packages you install determine which skills are available:

| Package | Skills | What they cover |
| --- | --- | --- |
| `@tanstack/hotkeys` | `hotkeys-core`, `app-hotkeys` | Defaults versus raw `keydown` listeners, `enabled`, scopes, targets, sequences, testing, app hotkeys, and recording |
| `@tanstack/<framework>-hotkeys` | `<framework>-hotkeys` | Framework bindings (such as `useHotkey` or `createHotkey`), provider scopes, pitfalls, and wiring app hotkeys |

Framework skills ship for every adapter (React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, and Octane) under `node_modules/<package>/skills/<skill-name>/SKILL.md`. Task-specific guides live in `references/` and stay unloaded until needed, such as `references/scopes.md` for stacked dialogs.

## Step 1: Install TanStack Hotkeys

If you haven't already, install the adapter for your framework. See [Installation](./installation) for the full package list.

```bash
pnpm add @tanstack/react-hotkeys
```

Every framework adapter includes `@tanstack/hotkeys` as a dependency, so both the framework skill and core skills are available without installing `@tanstack/hotkeys` separately.

## Step 2: Run `intent install`

From your project root, run:

```bash
npx @tanstack/intent@latest install
```

This discovers skills from your installed dependencies and writes a lightweight skill-loading block into your agent config (`AGENTS.md` by default, or `CLAUDE.md`, `.cursorrules`, and `.github/copilot-instructions.md`).

## Step 3: Review the generated guidance

The CLI adds an `intent-skills` block like this:

```markdown
<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->
```

Keep this block near the top of your config file so agents read it before task-specific rules.

Inspect installed skills directly from the terminal. In a React project:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @tanstack/react-hotkeys#react-hotkeys
npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core
```

For explicit task-to-skill mappings instead of dynamic discovery, run `npx @tanstack/intent@latest install --map`.

## Step 4: Verify in a fresh agent session

Open a new session in your coding agent and try a prompt like: _"Add Mod+S to save the document, and a dialog that closes with Escape, using TanStack Hotkeys."_

The agent should:

- Call the adapter API (`useHotkey('Mod+S', ...)`) instead of `addEventListener('keydown', ...)`
- Use `Mod` and the adapter's label formatter (`useFormatForDisplay`) instead of manual `isMac` or `⌘` checks
- Rely on built-in `ignoreInputs` and `preventDefault` defaults rather than reimplementing them
- Put the dialog's `Escape` shortcut inside an `exclusive` scope instead of toggling a global flag
- Pass `meta: { name }` or declare app hotkeys when shortcuts need a cheat sheet

If it still generates manual key listeners, confirm the `intent-skills` block is near the top of your agent config and run `npx @tanstack/intent@latest list` to verify the packages are detected.

## Keeping skills current

Skills update automatically alongside your `node_modules` packages. Standard discovery mode needs no CLI rerun after updates. If you used `--map`, rerun `npx @tanstack/intent@latest install --map` after adding or updating intent-enabled packages.

## Wiring skills manually

If you'd rather not use the CLI, point your agent config directly to the installed skill files:

```markdown
When working on keyboard shortcuts with TanStack Hotkeys, read and follow:
node_modules/@tanstack/hotkeys/skills/hotkeys-core/SKILL.md
node_modules/@tanstack/react-hotkeys/skills/react-hotkeys/SKILL.md
```

> [!NOTE]
> With `pnpm`, `@tanstack/hotkeys` isn't hoisted to the root `node_modules`, so the first path won't exist directly. Use the CLI or point to the nested `node_modules/.pnpm` path.

## Learn more

- [TanStack Intent documentation](https://tanstack.com/intent/latest/docs/overview) covers `scaffold`, `validate`, and CI checks for library authors.
- [Agent Skills registry](https://tanstack.com/intent/registry) lists other intent-enabled TanStack packages.
