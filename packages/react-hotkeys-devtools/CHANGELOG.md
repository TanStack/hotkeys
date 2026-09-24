# @tanstack/react-hotkeys-devtools

## 0.9.0

### Minor Changes

- [#157](https://github.com/TanStack/hotkeys/pull/157) [`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9) - Publish ES2022 ESM-only packages with a Node.js 20 minimum, matching TanStack Table v9. CommonJS builds, package `src` directories, and source maps are no longer published. Use ESM imports and inspect the declarations in `dist` for installed API types.

  Expose the existing Solid devtools production entry with TypeScript declarations.

  Update framework, store, devtools, and build dependencies while retaining TypeScript 6.0.3. Adapt devtools styling to the new `createTheme` API. Upgrade `@tanstack/preact-store` to 0.13.3, which fixes stale hint updates when shortcut bindings change.

### Patch Changes

- Updated dependencies [[`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9)]:
  - @tanstack/hotkeys-devtools@2.0.0

## 0.8.0

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
  - @tanstack/hotkeys-devtools@1.0.0

## 0.7.0

### Minor Changes

- feat: upgrade to latest tanstack store version ([`3104ee4`](https://github.com/TanStack/hotkeys/commit/3104ee494edd9877249c46b648af27d31cfd8c9c))

### Patch Changes

- Updated dependencies [[`3104ee4`](https://github.com/TanStack/hotkeys/commit/3104ee494edd9877249c46b648af27d31cfd8c9c)]:
  - @tanstack/hotkeys-devtools@0.9.0

## 0.6.6

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.8.1

## 0.6.5

### Patch Changes

- Updated dependencies [[`63bfa22`](https://github.com/TanStack/hotkeys/commit/63bfa229b98427fd1f603095fb3435d66ceeda09)]:
  - @tanstack/hotkeys-devtools@0.8.0

## 0.6.4

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.7.4

## 0.6.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.7.3

## 0.6.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.7.2

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.7.1

## 0.6.0

### Minor Changes

- Refactor hotkey normalization and display formatting APIs in `@tanstack/hotkeys`, align framework packages and devtools, and update display-related constants. ([#85](https://github.com/TanStack/hotkeys/pull/85))

### Patch Changes

- Updated dependencies [[`74b474d`](https://github.com/TanStack/hotkeys/commit/74b474db6e44ad2d0a92f97898f5b145f00b9b93)]:
  - @tanstack/hotkeys-devtools@0.7.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.5.0

## 0.4.4

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.4.4

## 0.4.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.4.3

## 0.4.2

### Patch Changes

- Updated dependencies [[`1f2eae6`](https://github.com/TanStack/hotkeys/commit/1f2eae668f6d20225903e2a818224eb8acb6c878)]:
  - @tanstack/hotkeys-devtools@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.4.1

## 0.4.0

### Minor Changes

- add angular adapter and upgrade packages ([#31](https://github.com/TanStack/hotkeys/pull/31))

### Patch Changes

- Updated dependencies [[`c173ed0`](https://github.com/TanStack/hotkeys/commit/c173ed079c6b0f282c9cf8dcb6d9523408eca5a0)]:
  - @tanstack/hotkeys-devtools@0.5.0

## 0.3.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.3.3

## 0.3.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.3.1

## 0.3.0

### Minor Changes

- feat: overhaul sequence-manager and hooks to be in feature parity with hotkey-manager. ([#21](https://github.com/TanStack/hotkeys/pull/21))

### Patch Changes

- Updated dependencies [[`7328e36`](https://github.com/TanStack/hotkeys/commit/7328e360f0e99b5374fb97c07e0f2a500d8e5b9c)]:
  - @tanstack/hotkeys-devtools@0.3.0

## 0.2.0

### Patch Changes

- Updated dependencies [[`8ae6b64`](https://github.com/TanStack/hotkeys/commit/8ae6b64ef10b53186c367f594f81ecdec15071d7)]:
  - @tanstack/hotkeys-devtools@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.1.1

## 0.1.0

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@0.1.0

## 0.0.2

### Patch Changes

- feat: initial release ([`341d167`](https://github.com/TanStack/hotkeys/commit/341d16731f09709a463343852ae4c0e1b6bc6613))

- Updated dependencies [[`341d167`](https://github.com/TanStack/hotkeys/commit/341d16731f09709a463343852ae4c0e1b6bc6613)]:
  - @tanstack/hotkeys-devtools@0.0.2

## 0.0.1

### Patch Changes

- feat: TanStack Hotkeys ([#5](https://github.com/TanStack/hotkeys/pull/5))

- Updated dependencies [[`e16b529`](https://github.com/TanStack/hotkeys/commit/e16b52983d4bf4ba249668591e8fc7133fcf8b85)]:
  - @tanstack/hotkeys-devtools@0.0.1
