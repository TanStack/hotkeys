# @tanstack/vue-hotkeys-devtools

## 0.13.0

### Minor Changes

- [#221](https://github.com/TanStack/hotkeys/pull/221) [`5bf96b6`](https://github.com/TanStack/hotkeys/commit/5bf96b68bba67b0e288bb7886c5f4516417a528f) - Server-rendered hotkey labels can match the user's platform.

  - `detectPlatform(userAgent)` detects the platform from a user agent string, such as a request's `User-Agent` header. `null`, as from a missing header, works like no argument. A new `HotkeyPlatform` type names the result.
  - Without a user agent, `detectPlatform()` returns `'linux'` on Node, Deno, Bun, and Cloudflare Workers instead of the server's own OS.
  - In development, formatting a label on the server without a platform warns once.
  - Providers accept `defaultOptions.platform`, which is also the default platform for their hotkeys and recorders.
  - Adapters that render on the server add a formatter hook that uses the provider's platform: `useFormatForDisplay` (React, Preact, Octane, Vue, Ember), `createFormatForDisplay` (Solid), `getFormatForDisplay` (Svelte), and `injectFormatForDisplay` (Angular).
  - Angular's `provideHotkeys` accepts `defaultOptions` as a getter that runs in the injection context, so it can read the request with `inject(REQUEST)`.

### Patch Changes

- Updated dependencies [[`5bf96b6`](https://github.com/TanStack/hotkeys/commit/5bf96b68bba67b0e288bb7886c5f4516417a528f)]:
  - @tanstack/hotkeys-devtools@1.8.0

## 0.12.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.7.3

## 0.12.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.7.2

## 0.12.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.7.1

## 0.12.0

### Minor Changes

- [#211](https://github.com/TanStack/hotkeys/pull/211) [`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b) - Each devtools adapter now lists its TanStack Devtools host as an optional peer dependency at the current release, such as `@tanstack/react-devtools` 0.10.14. Older hosts pass the plugin a theme string instead of props, so the panel ignored the theme, and TypeScript rejects the React plugin since `@tanstack/react-hotkeys-devtools` 0.12.0. Package managers now warn about an old host at install time.

  Update `@tanstack/devtools-utils` and `@tanstack/devtools-ui` to 0.7.2. The Preact panel now unmounts its core on Preact 11 (TanStack/devtools#551).

### Patch Changes

- Updated dependencies [[`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b), [`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b)]:
  - @tanstack/hotkeys-devtools@1.7.0

## 0.11.2

### Patch Changes

- [#204](https://github.com/TanStack/hotkeys/pull/204) [`5053876`](https://github.com/TanStack/hotkeys/commit/5053876bbd97d6b056cef9eddddcc4e28c249aba) - Fix type errors in the devtools packages with `skipLibCheck: false`. Their declarations used types from `@tanstack/devtools-utils`, which import `@tanstack/devtools` without depending on it, so TypeScript reported `Cannot find module '@tanstack/devtools'`, and with `skipLibCheck: true` the panel props became `any`. The packages now declare their own panel and plugin types. `@tanstack/hotkeys-devtools` exports `HotkeysDevtoolsPanelProps`, `HotkeysDevtoolsTheme` and `HotkeysDevtoolsCoreClass`.

  The React devtools types no longer refer to `JSX` from `react`, which some `@types/react` 18 releases don't export.

- [#204](https://github.com/TanStack/hotkeys/pull/204) [`5053876`](https://github.com/TanStack/hotkeys/commit/5053876bbd97d6b056cef9eddddcc4e28c249aba) - Fix `HotkeysDevtoolsPanel`, which threw `Cannot read properties of undefined (reading 'color')` and rendered nothing, both on its own and inside `TanStackDevtools` from `@tanstack/vue-devtools`. The panel now defaults `theme` to `'dark'` and `devtoolsOpen` to `true`, reads the props the Vue devtools dock passes, and remounts when the theme changes.

  The package no longer depends on `@tanstack/devtools-utils`, and its `vue` peer is now `>=3.3.0`, matching `@tanstack/vue-hotkeys`.

- Updated dependencies [[`5053876`](https://github.com/TanStack/hotkeys/commit/5053876bbd97d6b056cef9eddddcc4e28c249aba)]:
  - @tanstack/hotkeys-devtools@1.6.1

## 0.11.1

### Patch Changes

- Updated dependencies [[`431094a`](https://github.com/TanStack/hotkeys/commit/431094a5a5b61a7fd91002fc1cc799373ef54e6e)]:
  - @tanstack/hotkeys-devtools@1.6.0

## 0.11.0

### Minor Changes

- [#194](https://github.com/TanStack/hotkeys/pull/194) [`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5) - Minor release alongside `@tanstack/hotkeys` 0.17.0, which this package now requires. There are no other changes.

### Patch Changes

- Updated dependencies [[`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5)]:
  - @tanstack/hotkeys-devtools@1.5.0

## 0.10.9

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.4.1

## 0.10.8

### Patch Changes

- Updated dependencies [[`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22), [`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22)]:
  - @tanstack/hotkeys-devtools@1.4.0

## 0.10.7

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.6

## 0.10.6

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.5

## 0.10.5

### Patch Changes

- Updated dependencies [[`125fde6`](https://github.com/TanStack/hotkeys/commit/125fde6f8ec30f076c40bead0f90ae09b3dc9e1f)]:
  - @tanstack/hotkeys-devtools@1.3.4

## 0.10.4

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.3

## 0.10.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.2

## 0.10.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.1

## 0.10.1

### Patch Changes

- Updated dependencies [[`a71180e`](https://github.com/TanStack/hotkeys/commit/a71180ec7f66be52f0aa268a2c2cce2f742d1602)]:
  - @tanstack/hotkeys-devtools@1.3.0

## 0.10.0

### Minor Changes

- [#165](https://github.com/TanStack/hotkeys/pull/165) [`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a) - Add Alpine, Ember, and Octane adapters with framework-native lifecycle management, scoped defaults, and shared registration reconciliation.

  Support reactive option getters and live recorder options. Follow replacement provider defaults in Solid and Vue, track getters in Ember definitions, and refresh Lit registrations and scoped targets after host updates.

  Add Ember `onHotkey` and `onHotkeys` modifiers for element-scoped shortcuts with reactive options and automatic cleanup.

  Add Angular and Svelte Hotkeys devtools integrations with development-only defaults and explicit production exports.

  Update compatible dependencies and release all Hotkeys adapters and devtools packages together as minor versions.

### Patch Changes

- Updated dependencies [[`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a)]:
  - @tanstack/hotkeys-devtools@1.2.0

## 0.9.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.1.1

## 0.9.0

### Minor Changes

- [#157](https://github.com/TanStack/hotkeys/pull/157) [`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9) - Publish ES2022 ESM-only packages with a Node.js 20 minimum, matching TanStack Table v9. CommonJS builds, package `src` directories, and source maps are no longer published. Use ESM imports and inspect the declarations in `dist` for installed API types.

  Expose the existing Solid devtools production entry with TypeScript declarations.

  Update framework, store, devtools, and build dependencies while retaining TypeScript 6.0.3. Adapt devtools styling to the new `createTheme` API. Upgrade `@tanstack/preact-store` to 0.13.3, which fixes stale hint updates when shortcut bindings change.

### Patch Changes

- Updated dependencies [[`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9)]:
  - @tanstack/hotkeys-devtools@1.1.0

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

## 0.3.0

### Minor Changes

- Initial Vue devtools release
