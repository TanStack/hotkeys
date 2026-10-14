# @tanstack/octane-hotkeys

## 0.4.0

### Minor Changes

- [#175](https://github.com/TanStack/hotkeys/pull/175) [`a71180e`](https://github.com/TanStack/hotkeys/commit/a71180ec7f66be52f0aa268a2c2cce2f742d1602) - Hotkeys now include sequences everywhere, and app hotkeys can be declared up front and customized by users.

  - A hotkey is a chord (`'Mod+S'`) or a sequence (`['G', 'G']`). Every adapter's hotkey and hotkeys APIs, `HotkeyManager.register`, `formatForDisplay`, `areHotkeysEqual`, `validateHotkey`, and hints accept both. A one-step sequence is its chord. Chords accept `requireReset`; sequences accept `timeout`, enforced by types.
  - Every adapter's recorder records sequences with `maxSteps` (default 1).
  - `defineAppHotkeys` declares every app hotkey. Pass them to the adapter's provider as `appHotkeys`, with optional `customHotkeys` and `onCustomHotkeysChange` to persist user changes. Each adapter can read and change them through its app hotkeys, app hotkey list, and custom hotkeys APIs (for example, React's `useAppHotkeys`, `useAppHotkeyList`, and `useCustomHotkeys`). Lit, Alpine, and Ember, which have no provider, use `provideAppHotkeys`. Devtools list declared hotkeys that are not registered.

  Breaking changes (React names shown; other adapters follow their own naming, such as `createHotkey`, `injectHotkey`, or `HotkeyController`):

  | Before                                                                   | After                                                           |
  | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
  | `Hotkey` (one chord)                                                     | `HotkeyChord`; `Hotkey` is now a chord or a sequence            |
  | `SequenceManager`, `getSequenceManager()`                                | `HotkeyManager`, `getHotkeyManager()`                           |
  | `useHotkeySequence(sequence, cb, options)`                               | `useHotkey(sequence, cb, options)`                              |
  | `useHotkeySequences([{ sequence, callback }])`                           | `useHotkeys([{ hotkey: sequence, callback }])`                  |
  | `useHotkeySequenceRecorder(options)`, `HotkeySequenceRecorder`           | `useHotkeyRecorder({ maxSteps, ...options })`, `HotkeyRecorder` |
  | Lit `@hotkeySequence`, `HotkeySequenceController`                        | `@hotkey`, `HotkeyController`                                   |
  | Lit `HotkeySequenceRecorderController`                                   | `HotkeyRecorderController` with `maxSteps`                      |
  | `useHotkeyRegistrations()` → `{ hotkeys, sequences }`                    | One list of chords and sequences; narrow with `kind`            |
  | `SequenceRegistrationView.sequence`                                      | `HotkeySequenceRegistrationView.hotkey`                         |
  | `HotkeyConflict.type`                                                    | `HotkeyConflict.registration.kind`                              |
  | Sequence callback `context.hotkey` (`'G G'`)                             | `context.hotkey` (`['G', 'G']`)                                 |
  | `defaultOptions.hotkeySequence`, `defaultOptions.hotkeySequenceRecorder` | `defaultOptions.hotkey`, `defaultOptions.hotkeyRecorder`        |
  | Vue `provideHotkeysContext(defaultOptions)`                              | `provideHotkeysContext({ defaultOptions, appHotkeys, ... })`    |
  | Svelte `setHotkeysContext(defaultOptions)`                               | `setHotkeysContext({ defaultOptions, appHotkeys, ... })`        |
  | Angular `provideHotkeys(defaultOptions)`                                 | `provideHotkeys({ defaultOptions, appHotkeys, ... })`           |
  | `HotkeyDefinition` (core)                                                | Each adapter's definition type, such as `UseHotkeyDefinition`   |
  | `createHotkeySequenceBindings` (adapter)                                 | `createHotkeyBindings`                                          |
  | `formatHotkeySequence`, `formatWithLabels`                               | `formatForDisplay`                                              |
  | `SequenceManager.resetAll()`                                             | `HotkeyManager.resetSequenceProgress()`                         |

### Patch Changes

- Updated dependencies [[`a71180e`](https://github.com/TanStack/hotkeys/commit/a71180ec7f66be52f0aa268a2c2cce2f742d1602)]:
  - @tanstack/hotkeys@0.12.0

## 0.3.0

### Minor Changes

- [#170](https://github.com/TanStack/hotkeys/pull/170) [`839ee94`](https://github.com/TanStack/hotkeys/commit/839ee941a9b2ee2cf5f70f28b161757bcfd61931) - Require octane `>=0.12.0` and depend on `@tanstack/octane-store` `^0.13.0`. `HotkeysProvider` now renders the context itself as the provider, since octane removed `Context.Provider`.

## 0.2.0

### Minor Changes

- [#165](https://github.com/TanStack/hotkeys/pull/165) [`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a) - Add Alpine, Ember, and Octane adapters with framework-native lifecycle management, scoped defaults, and shared registration reconciliation.

  Support reactive option getters and live recorder options. Follow replacement provider defaults in Solid and Vue, track getters in Ember definitions, and refresh Lit registrations and scoped targets after host updates.

  Add Ember `onHotkey` and `onHotkeys` modifiers for element-scoped shortcuts with reactive options and automatic cleanup.

  Add Angular and Svelte Hotkeys devtools integrations with development-only defaults and explicit production exports.

  Update compatible dependencies and release all Hotkeys adapters and devtools packages together as minor versions.

### Patch Changes

- Updated dependencies [[`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a)]:
  - @tanstack/hotkeys@0.11.0
