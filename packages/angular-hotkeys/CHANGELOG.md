# @tanstack/angular-hotkeys

## 0.12.0

### Minor Changes

- [#157](https://github.com/TanStack/hotkeys/pull/157) [`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9) - Publish ES2022 ESM-only packages with a Node.js 20 minimum, matching TanStack Table v9. CommonJS builds, package `src` directories, and source maps are no longer published. Use ESM imports and inspect the declarations in `dist` for installed API types.

  Expose the existing Solid devtools production entry with TypeScript declarations.

  Update framework, store, devtools, and build dependencies while retaining TypeScript 6.0.3. Adapt devtools styling to the new `createTheme` API. Upgrade `@tanstack/preact-store` to 0.13.3, which fixes stale hint updates when shortcut bindings change.

### Patch Changes

- Updated dependencies [[`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9)]:
  - @tanstack/hotkeys@0.10.0

## 0.11.0

### Minor Changes

- - breaking: `RawHotkey` and `ParsedHotkey` are now unions containing either `key` or `code`. Use type intersections instead of extending them with interfaces. ([#151](https://github.com/TanStack/hotkeys/pull/151))
  - breaking: Recorders default to physical codes. Set `recordBy: 'key'` to record logical keys.
  - breaking: Clearing a recording calls only `onClear`, without calling `onRecord` with an empty value.
  - feat: Support typed physical bindings such as `Mod+[KeyS]` and `{ code: 'KeyS', mod: true }`.
  - feat: Support F1–F24, additional named keys, and more punctuation shortcuts.
  - feat: Add a platform option to `parseKeyboardEvent`.
  - feat: Add recorder `recordBy`, `validate`, `detectConflicts`, and `onReject` options.
  - feat: Add `findHotkeyConflicts`, including sequence-prefix checks.
  - feat: Add `HotkeyMeta.group`.
  - feat: Add `matchesHeldModifiers` and shortcut hint helpers for every framework adapter.
  - feat: Add `formatForDisplay` support for parsed bindings, `parts`, separate modifier/key symbols, `keyLabels`, and a resolved `layoutMap`.
  - fix: Improve shortcut matching across keyboard layouts, macOS Option keys, shifted punctuation, and numpad keys.
  - fix: Prefer exact matches over physical-key fallbacks in hotkeys and sequences.
  - fix: Handle literal plus shortcuts such as `Mod++` and Unicode key names correctly.
  - fix: Avoid triggering shortcuts during IME composition and AltGraph character entry.
  - fix: Clear held-key and `requireReset` state correctly when released keys produce different characters.
  - fix: Prevent recording keystrokes, repeats, and releases from triggering registered shortcuts.
  - fix: Display readable physical-key labels, such as `S` instead of `KeyS`.
  - fix: Recognize equivalent hotkey aliases in registration lookups and conflict checks, including sequences.
  - fix: Avoid unnecessary registration updates and handle target changes correctly in React and Preact.
  - fix: Reject bracketed physical codes in logical `key` fields.
  - fix: Reset shortcuts when keys are released inside inputs or while disabled.
  - fix: Respect recorder `ignoreInputs` inside shadow roots.
  - fix: Preserve Shift when recording logical AltGraph shortcuts.
  - fix: Ignore modifier and composition events in standalone sequence matching.
  - fix: Ignore repeated keydowns when matching sequences.
  - fix: Prevent continuous rerenders when reading Preact hotkey registrations.
  - fix: Allow Svelte recorder controls to be passed directly to event handlers.
  - fix: Update devtools conflict reporting, plus-key formatting, group search, and key/code labels.

### Patch Changes

- Updated dependencies [[`10c2555`](https://github.com/TanStack/hotkeys/commit/10c255560b5a29d94647c0f4497bb4b44b123323)]:
  - @tanstack/hotkeys@0.9.0

## 0.10.0

### Minor Changes

- feat: upgrade to latest tanstack store version ([`3104ee4`](https://github.com/TanStack/hotkeys/commit/3104ee494edd9877249c46b648af27d31cfd8c9c))

### Patch Changes

- Updated dependencies [[`3104ee4`](https://github.com/TanStack/hotkeys/commit/3104ee494edd9877249c46b648af27d31cfd8c9c)]:
  - @tanstack/hotkeys@0.8.0

## 0.9.1

### Patch Changes

- Updated dependencies [[`0e46137`](https://github.com/TanStack/hotkeys/commit/0e46137405aa2d05f2e0a03d5c675d87c7218aab)]:
  - @tanstack/hotkeys@0.7.1

## 0.9.0

### Minor Changes

- feat: options.meta with name and descriptions by default and new useHotkeysRegistrations hooks ([#95](https://github.com/TanStack/hotkeys/pull/95))

### Patch Changes

- Updated dependencies [[`63bfa22`](https://github.com/TanStack/hotkeys/commit/63bfa229b98427fd1f603095fb3435d66ceeda09)]:
  - @tanstack/hotkeys@0.7.0

## 0.8.4

### Patch Changes

- Updated dependencies [[`b04c88e`](https://github.com/TanStack/hotkeys/commit/b04c88ee0e07be3eef8dc2852868c0421efce26d)]:
  - @tanstack/hotkeys@0.6.4

## 0.8.3

### Patch Changes

- Updated dependencies [[`1999147`](https://github.com/TanStack/hotkeys/commit/1999147e6369896695975bf8042a2b178b15c366)]:
  - @tanstack/hotkeys@0.6.3

## 0.8.2

### Patch Changes

- Updated dependencies [[`6939ac7`](https://github.com/TanStack/hotkeys/commit/6939ac7f91ce8b5ffe54cdc122171f277c837c92)]:
  - @tanstack/hotkeys@0.6.2

## 0.8.1

### Patch Changes

- chore: upgrade tanstack store version ([`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb))

- Updated dependencies [[`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb)]:
  - @tanstack/hotkeys@0.6.1

## 0.8.0

### Minor Changes

- Refactor hotkey normalization and display formatting APIs in `@tanstack/hotkeys`, align framework packages and devtools, and update display-related constants. ([#85](https://github.com/TanStack/hotkeys/pull/85))

### Patch Changes

- Updated dependencies [[`74b474d`](https://github.com/TanStack/hotkeys/commit/74b474db6e44ad2d0a92f97898f5b145f00b9b93)]:
  - @tanstack/hotkeys@0.6.0

## 0.7.0

### Minor Changes

- Add plural sequence APIs (`useHotkeySequences`, `createHotkeySequences`, `createHotkeySequencesAttachment`, `injectHotkeySequences`) and align `enabled` across adapters: disabled registrations stay in the manager for devtools, only core dispatch is skipped, and toggling `enabled` updates handles via `setOptions` instead of churning unregister/register. ([#80](https://github.com/TanStack/hotkeys/pull/80))

## 0.6.0

### Minor Changes

- Align sequence recording with hotkey-prefixed public API: `HotkeySequenceRecorder`, framework hooks `useHotkeySequenceRecorder` / `createHotkeySequenceRecorder` / `injectHotkeySequenceRecorder`, and provider defaults under `hotkeySequenceRecorder`. ([#78](https://github.com/TanStack/hotkeys/pull/78))

### Patch Changes

- Updated dependencies [[`e04555e`](https://github.com/TanStack/hotkeys/commit/e04555e234bfed439f59c319cc9039a515770d72)]:
  - @tanstack/hotkeys@0.5.0

## 0.5.1

### Patch Changes

- fix: add jsdoc for combos in hotkey sequences ([`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c))

- Updated dependencies [[`a3aa4f3`](https://github.com/TanStack/hotkeys/commit/a3aa4f351067303e792088590067879f639e5d30), [`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c)]:
  - @tanstack/hotkeys@0.4.3

## 0.5.0

### Minor Changes

- feat: add `injectHotkeys` for registering multiple hotkeys in one call ([#75](https://github.com/TanStack/hotkeys/pull/75))

## 0.4.2

### Patch Changes

- Updated dependencies [[`ac2248c`](https://github.com/TanStack/hotkeys/commit/ac2248c0f5a74db8784fc729861250d75d370db2)]:
  - @tanstack/hotkeys@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`eaf8b84`](https://github.com/TanStack/hotkeys/commit/eaf8b849d198576c7299d34574c6907581cebfb6)]:
  - @tanstack/hotkeys@0.4.1

## 0.4.0

### Minor Changes

- add angular adapter and upgrade packages ([#31](https://github.com/TanStack/hotkeys/pull/31))

### Patch Changes

- Updated dependencies [[`c173ed0`](https://github.com/TanStack/hotkeys/commit/c173ed079c6b0f282c9cf8dcb6d9523408eca5a0)]:
  - @tanstack/hotkeys@0.4.0
