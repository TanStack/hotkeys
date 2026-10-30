# @tanstack/octane-hotkeys

## 0.7.1

### Patch Changes

- Updated dependencies [[`132e0c9`](https://github.com/TanStack/hotkeys/commit/132e0c99cb4c168ba4f7e0cd5abb5e8eadb70864), [`ebd7e84`](https://github.com/TanStack/hotkeys/commit/ebd7e84a529fddecb495d0cc92beb17876c268e9), [`d43b9aa`](https://github.com/TanStack/hotkeys/commit/d43b9aa6e445fd53a5de428e7eb6aaca5f6008ee)]:
  - @tanstack/hotkeys@0.19.0

## 0.7.0

### Minor Changes

- [#199](https://github.com/TanStack/hotkeys/pull/199) [`431094a`](https://github.com/TanStack/hotkeys/commit/431094a5a5b61a7fd91002fc1cc799373ef54e6e) - Hotkey hints now show only for hotkeys that can fire. `useHotkeyHint` and the other adapters' hint helpers return `false` unless a registration of the hotkey can fire: it's enabled, in an active scope, and, for a hotkey on an element, focus is inside that element. Hotkeys registered with `enabled: false`, hotkeys suspended by an exclusive scope, hotkeys on an element that doesn't have focus, and hotkeys that nothing registered no longer show hints. App hotkeys match their registrations by id, so custom hotkeys still work. To keep the old behavior, call `matchesHeldModifiers`, which still checks only held keys. The new `HotkeyManager.hasActiveRegistration(hotkey)` reports whether a hotkey or app hotkey has a registration that can fire.

  Add `preventDefault: 'always'`. A chord with this option still prevents the browser's action while it can't fire, because it's disabled or its scope is inactive or suspended. For example, a disabled `Mod+S` no longer opens the browser's Save dialog. It doesn't stop propagation, and it still skips typing in text fields. When another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. Set it in default options to apply it to every hotkey. We recommend it for most hotkeys; the sensible defaults guide explains when to leave it off, such as for `Mod+C` or `Tab` hotkeys you turn off to hand the key back to the browser. Devtools show `always` for these hotkeys.

  Registration views now have a `status`: `'active'` when the hotkey is enabled and its scope is active, `'suspended'` when its scope is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. To list only the hotkeys that are on, filter by `status === 'active'` instead of checking `enabled` and `isScopeActive` yourself.

  Each adapter has a new API that reads the hotkey manager's scope state and updates when scopes activate or release: `useHotkeyScopesState` in React, Preact, Vue, Ember, and Octane, `createHotkeyScopesState` in Solid and on Alpine's `createHotkeysScope` owner, `injectHotkeyScopesState` in Angular, `getHotkeyScopesState` in Svelte, and `HotkeyScopesStateController` in Lit.

### Patch Changes

- Updated dependencies [[`431094a`](https://github.com/TanStack/hotkeys/commit/431094a5a5b61a7fd91002fc1cc799373ef54e6e)]:
  - @tanstack/hotkeys@0.18.0

## 0.6.0

### Minor Changes

- [#194](https://github.com/TanStack/hotkeys/pull/194) [`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5) - Ship [TanStack Intent](https://tanstack.com/intent) skills with each package, so coding agents use the library's own APIs instead of hand-written keydown listeners and wrappers. `@tanstack/hotkeys` includes `hotkeys-core` and `app-hotkeys`, and each framework package includes a skill for its bindings. List them with `npx @tanstack/intent@latest list`.

### Patch Changes

- Updated dependencies [[`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5)]:
  - @tanstack/hotkeys@0.17.0

## 0.5.1

### Patch Changes

- Updated dependencies [[`daecd95`](https://github.com/TanStack/hotkeys/commit/daecd9508f16a016a7a30314e3d63a5fd76a654d)]:
  - @tanstack/hotkeys@0.16.1

## 0.5.0

### Minor Changes

- [#189](https://github.com/TanStack/hotkeys/pull/189) [`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22) - Types and functions now follow one naming rule: a hotkey is a chord or a sequence, a chord is keys pressed together, and a sequence is chords pressed one after another. A name with `Hotkey` alone accepts both kinds. Names for one kind say `Chord` or `Sequence`.

  Hotkey callbacks receive a context with the same chord and sequence shapes as registration views. A chord's callback gets `{ kind: 'chord', hotkey, parsedChord }`. A sequence's callback gets `{ kind: 'sequence', hotkey, parsedSequence }` with every step parsed. Before, a sequence's `parsedHotkey` held only its last step. The recorder's `validate` context is split the same way: `{ kind: 'chord', event, parsedChord }` or `{ kind: 'sequence', events, parsedSequence }`.

  `useHotkey`, `HotkeyManager.register`, the Lit `@hotkey` decorator, and the other APIs that take one hotkey type the context from the hotkey you pass, so a chord's callback can read `parsedChord` without a check. Callbacks in `useHotkeys` arrays, and callbacks typed `HotkeyCallback`, receive either shape. Check `context.kind` before reading `parsedChord` or `parsedSequence`. A one-step array such as `['Escape']` now gets chord options and chord context, which matches how it registers.

  Sequence steps can be chord objects as well as strings, such as `[{ key: 'K', mod: true }, 'C']`. The new `RegisterableHotkeySequence` type describes them. Registered sequences store each step as a string.

  Every step that advances a sequence now calls `preventDefault`, not only the last one. In `['Mod+K', 'Mod+C']`, the browser no longer runs its own `Ctrl+K` on the first step. `stopPropagation` still applies only on the last step, so earlier steps reach other listeners. To let the browser act on every step, set `preventDefault: false`.

  A sequence's progress now clears when its timeout passes, and registration subscribers are notified. Before, progress cleared only on the next key press, so `matchedStepCount` could stay above 0 after the timeout.

  Renamed:

  - `RawHotkey` to `RawHotkeyChord`
  - `ParsedHotkey` to `ParsedHotkeyChord`
  - `SingleModifierHotkey`, `TwoModifierHotkey`, `ThreeModifierHotkey`, and `FourModifierHotkey` to `SingleModifierHotkeyChord`, `TwoModifierHotkeyChord`, `ThreeModifierHotkeyChord`, and `FourModifierHotkeyChord`
  - `parsedHotkey` to `parsedChord` on chord registration views, callback contexts, and recorder validation contexts
  - `createHotkeyHandler` to `createHotkeyChordHandler`, `createMultiHotkeyHandler` to `createMultiHotkeyChordHandler`, `MultiHotkeyHandler` to `MultiHotkeyChordHandler`, and `CreateHotkeyHandlerOptions` to `CreateHotkeyChordHandlerOptions`

  Merged:

  - `parseHotkey` parses chord strings, chord objects, and sequences. It replaces `parseRegisterableHotkey` and `rawHotkeyToParsedHotkey`.
  - `normalizeHotkey` normalizes chord strings, chord objects, parsed chords, and sequences. It replaces `normalizeRegisterableHotkey` and `normalizeHotkeyFromParsed`. Replace `normalizeHotkeyFromEvent(event)` with `normalizeHotkey(parseKeyboardEvent(event))`.
  - `formatHotkey` also formats a parsed sequence, returning one string per step.

- [#189](https://github.com/TanStack/hotkeys/pull/189) [`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22) - Add hotkey scopes, which turn groups of hotkeys on and off together, such as everything in a dialog.

  - Every hotkey belongs to a scope. The default scope, `'global'`, is always active. Pass `scope` to a hotkey to put it in another scope.
  - `HotkeyManager.activateScope(scope, options)` activates a scope until you call the function it returns. When hotkeys in two active scopes match the same key, a nested scope beats the scopes around it, and otherwise the most recently activated scope wins.
  - An exclusive scope suspends every other scope, including `'global'`, while it's active. Pass `exclusive: { allow: ['global'] }` to keep some scopes working.
  - `HotkeyManager.scopes` publishes which scopes are active, suspended, allowed, and exclusive. `isScopeActive(scope)` reports whether a scope's hotkeys can fire.
  - In React, Preact, Solid, Vue, Svelte, and Octane, `HotkeysProvider` takes `scope`, `exclusive`, and `enabled`. Hotkeys registered inside a scoped provider belong to its scope, which is active while the provider is mounted and enabled. Vue's `provideHotkeysContext` and Svelte's `setHotkeysContext` take the same options. In Angular, pass them to `provideHotkeys` in a component's `providers`.
  - In Lit, Alpine, and Ember, activate scopes with the hotkey manager, and pass `scope` to the hotkeys that belong to them.
  - App hotkeys can declare a `scope`. App hotkeys in different scopes can share a hotkey without a conflict. The app hotkey list reports `'suspended'` for an app hotkey whose enabled registrations are all in inactive scopes.
  - Devtools group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.

### Patch Changes

- Updated dependencies [[`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22), [`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22)]:
  - @tanstack/hotkeys@0.16.0

## 0.4.5

### Patch Changes

- Updated dependencies [[`f5a9816`](https://github.com/TanStack/hotkeys/commit/f5a98160488e3facd8a6e608d1423813e362c0dc)]:
  - @tanstack/hotkeys@0.15.1

## 0.4.4

### Patch Changes

- Updated dependencies [[`d7a7e81`](https://github.com/TanStack/hotkeys/commit/d7a7e819db345228f2955729a32d7fc18f8267d4)]:
  - @tanstack/hotkeys@0.15.0

## 0.4.3

### Patch Changes

- Updated dependencies [[`a9b29f5`](https://github.com/TanStack/hotkeys/commit/a9b29f511faf33ecaa416b5137f4e66af1d44c06), [`f8f02f0`](https://github.com/TanStack/hotkeys/commit/f8f02f01e17d62f4323357d30f4b9ae50f797a88)]:
  - @tanstack/hotkeys@0.14.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`c2ee2e4`](https://github.com/TanStack/hotkeys/commit/c2ee2e428e0c3cb8a9e5f56ec519e1db267c1ccc), [`3b7c92f`](https://github.com/TanStack/hotkeys/commit/3b7c92f1ed814c0d3ae744b29b04c2ba92c47607)]:
  - @tanstack/hotkeys@0.13.0

## 0.4.1

### Patch Changes

- Updated dependencies [[`575dc91`](https://github.com/TanStack/hotkeys/commit/575dc912dad2efca59175e18aa877eb0996d17bc)]:
  - @tanstack/hotkeys@0.12.1

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
