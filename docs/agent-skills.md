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

You're building with TanStack Hotkeys and using an AI coding agent such as Claude Code, Cursor, GitHub Copilot, or Codex. The agent keeps writing `keydown` listeners that check `event.metaKey`, adds `isMac` checks for shortcut labels, or builds its own shortcut registry next to the library. By the end of this guide, your agent will load TanStack Hotkeys' bundled skills automatically whenever you work on keyboard shortcuts, and those skills will stay in sync with whichever TanStack Hotkeys version your project installs.

## What are Agent Skills?

Agent Skills are markdown documents (`SKILL.md`) that ship inside npm packages and tell AI coding agents how to use a library correctly: which functions to use, which patterns to avoid, and when to reach for a particular feature. The format is an open standard supported by Claude Code, Cursor, GitHub Copilot, Codex, and others.

TanStack Hotkeys publishes skills inside its packages so the guidance travels with `npm update` instead of being pinned in a model's training data or copied into an agent configuration file manually.

## Skills Shipped by TanStack Hotkeys

The skills available to your agent depend on which packages your project installs:

| Package                         | Skills                            | What they teach                                                                                                                                                                         |
| ------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/hotkeys`             | `hotkeys-core`, `app-hotkeys`     | When to use the library instead of `keydown` listeners, how hotkeys turn on and off (`enabled`, scopes, targets), sequences, testing, and app hotkeys for cheat sheets and rebinding. |
| `@tanstack/<framework>-hotkeys` | `<framework>-hotkeys`             | The adapter's API, such as `useHotkey` or `createHotkey`, providers and dialog scopes, and framework-specific pitfalls. Each adapter also has a reference for wiring app hotkeys.        |

Adapter skills exist for React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, and Octane.

Each skill lives under `node_modules/<package>/skills/<skill-name>/SKILL.md` once the package is installed. Its `references/` directory contains guidance for specific tasks. For example, nested and stacked scopes live in `@tanstack/hotkeys/skills/hotkeys-core/references/scopes.md`.

The entry point tells the agent when to read each reference. Building a settings screen loads the app hotkeys and recording guidance; scope and testing references stay unloaded until a task needs them. Adapter skills load `hotkeys-core` first and then explain their own bindings.

Intent lists entry points and loads one requested `SKILL.md` at a time. The agent follows its prerequisite instructions and reads relevant references. A React project has three Hotkeys entry points: `hotkeys-core`, `app-hotkeys`, and `react-hotkeys`. Other installed libraries add their own entries.

## Step 1: Install TanStack Hotkeys

If you haven't already, install the adapter for your framework. See [Installation](./installation) for the full package list.

```bash
pnpm add @tanstack/react-hotkeys
```

Framework adapters install `@tanstack/hotkeys` as a dependency, so both the framework-specific and core skills are available to the installer. Don't install `@tanstack/hotkeys` separately alongside an adapter.

## Step 2: Run `intent install`

From the root of your project, run:

```bash
npx @tanstack/intent@latest install
```

The CLI writes lightweight skill-loading guidance into your agent's config file. That guidance tells the agent to discover skills from the packages installed in your project and load the most relevant one before it starts a substantial task.

By default the guidance lands in `AGENTS.md`. The CLI can also update:

- `CLAUDE.md` for Claude Code
- `.cursorrules` for Cursor
- `.github/copilot-instructions.md` for GitHub Copilot

## Step 3: Review the Generated Guidance

The install command appends (or creates) an `intent-skills` block that looks like this:

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

Keep the block near the top of the config file so your agent sees it before task-specific instructions.

You can inspect and load Hotkeys skills yourself with the same commands:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @tanstack/react-hotkeys#react-hotkeys
npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core
```

For dialogs that stack or nest scopes, follow the loaded entry point's link to `references/scopes.md`. The load command resolves relative Markdown links to the installed package, including when your package manager uses nested dependency paths.

If you prefer explicit task-to-skill entries, run `npx @tanstack/intent@latest install --map`. Mapping mode scans your installed intent-enabled packages and writes compact `id`, `run`, and `for` entries into the managed block.

## Step 4: Confirm It's Wired Up

Open a fresh session in your coding agent and ask it to build something with TanStack Hotkeys, for example: _"Add Mod+S to save the document, and a dialog that closes with Escape, using TanStack Hotkeys."_

You should see:

- The agent registers shortcuts with the adapter API, such as `useHotkey('Mod+S', ...)`, instead of a `keydown` listener.
- It uses `Mod` and `formatForDisplay` instead of `isMac` checks and hand-written `⌘`/`Ctrl` labels.
- It relies on the defaults for text inputs and `preventDefault` instead of reimplementing them.
- The dialog's `Escape` is registered inside an `exclusive` scope with a per-instance name, instead of a "shortcuts enabled" flag.
- Shortcuts that need a help dialog carry `meta: { name }`, or are declared as app hotkeys.

If the agent still writes its own key handling, reopen its config file and confirm the `intent-skills` block is present. You can also run `intent list` to confirm that the installed Hotkeys packages are detected and `intent load` to inspect the matching guidance directly.

## Keeping Skills Current

Skills are versioned with each package. When you update your TanStack Hotkeys packages, the `SKILL.md` files under `node_modules` update with them. No CLI rerun is needed. If you use explicit mappings, rerun `npx @tanstack/intent@latest install --map` after adding another intent-enabled package, or when you want to refresh the mappings.

## Using Skills Without the CLI

If you'd rather wire skills in yourself, reference them directly from `node_modules` in any agent config file. The minimum your agent needs is a pointer to the relevant files:

```markdown
When working on keyboard shortcuts with TanStack Hotkeys, read and follow:
node_modules/@tanstack/hotkeys/skills/hotkeys-core/SKILL.md
node_modules/@tanstack/react-hotkeys/skills/react-hotkeys/SKILL.md
```

With pnpm, `@tanstack/hotkeys` isn't hoisted to the top-level `node_modules`, so the first path doesn't exist. Use the CLI, or point at the core package inside `node_modules/.pnpm`.

The CLI is recommended because it discovers installed packages automatically and stays consistent with the Agent Skills standard, but the underlying file paths are stable.

## Learn More

- [TanStack Intent documentation](https://tanstack.com/intent/latest/docs/overview), the CLI's full reference, including `scaffold`, `validate`, and CI setup for library maintainers.
- [Agent Skills registry](https://tanstack.com/intent/registry), where you can browse other intent-enabled packages.
