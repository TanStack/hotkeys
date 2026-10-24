# @tanstack/hotkeys

## 0.18.0

### Minor Changes

- [#199](https://github.com/TanStack/hotkeys/pull/199) [`431094a`](https://github.com/TanStack/hotkeys/commit/431094a5a5b61a7fd91002fc1cc799373ef54e6e) - Hotkey hints now show only for hotkeys that can fire. `useHotkeyHint` and the other adapters' hint helpers return `false` unless a registration of the hotkey can fire: it's enabled, in an active scope, and, for a hotkey on an element, focus is inside that element. Hotkeys registered with `enabled: false`, hotkeys suspended by an exclusive scope, hotkeys on an element that doesn't have focus, and hotkeys that nothing registered no longer show hints. App hotkeys match their registrations by id, so custom hotkeys still work. To keep the old behavior, call `matchesHeldModifiers`, which still checks only held keys. The new `HotkeyManager.hasActiveRegistration(hotkey)` reports whether a hotkey or app hotkey has a registration that can fire.

  Add `preventDefault: 'always'`. A chord with this option still prevents the browser's action while it can't fire, because it's disabled or its scope is inactive or suspended. For example, a disabled `Mod+S` no longer opens the browser's Save dialog. It doesn't stop propagation, and it still skips typing in text fields. When another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. Set it in default options to apply it to every hotkey. We recommend it for most hotkeys; the sensible defaults guide explains when to leave it off, such as for `Mod+C` or `Tab` hotkeys you turn off to hand the key back to the browser. Devtools show `always` for these hotkeys.

  Registration views now have a `status`: `'active'` when the hotkey is enabled and its scope is active, `'suspended'` when its scope is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. To list only the hotkeys that are on, filter by `status === 'active'` instead of checking `enabled` and `isScopeActive` yourself.

  Each adapter has a new API that reads the hotkey manager's scope state and updates when scopes activate or release: `useHotkeyScopesState` in React, Preact, Vue, Ember, and Octane, `createHotkeyScopesState` in Solid and on Alpine's `createHotkeysScope` owner, `injectHotkeyScopesState` in Angular, `getHotkeyScopesState` in Svelte, and `HotkeyScopesStateController` in Lit.

## 0.17.0

### Minor Changes

- [#194](https://github.com/TanStack/hotkeys/pull/194) [`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5) - Ship [TanStack Intent](https://tanstack.com/intent) skills with each package, so coding agents use the library's own APIs instead of hand-written keydown listeners and wrappers. `@tanstack/hotkeys` includes `hotkeys-core` and `app-hotkeys`, and each framework package includes a skill for its bindings. List them with `npx @tanstack/intent@latest list`.

## 0.16.1

### Patch Changes

- [#193](https://github.com/TanStack/hotkeys/pull/193) [`daecd95`](https://github.com/TanStack/hotkeys/commit/daecd9508f16a016a7a30314e3d63a5fd76a654d) - AltGr with a key that types nothing new, such as AltGr+Home, or AltGr+F on a layout with nothing on that key, no longer fires hotkeys without modifiers. Before, AltGr+F fired `F` on layouts such as Windows Norwegian. On Windows, which reports AltGr as Control+Alt, these presses now fire `Control+Alt` hotkeys instead, as in native Windows apps: AltGr+Home triggers `Control+Alt+Home`, and the recorder records it as Control+Alt. Characters typed with AltGr, such as `@` or `€`, still match as before and never trigger `Control+Alt` hotkeys.

## 0.16.0

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

## 0.15.1

### Patch Changes

- [#187](https://github.com/TanStack/hotkeys/pull/187) [`f5a9816`](https://github.com/TanStack/hotkeys/commit/f5a98160488e3facd8a6e608d1423813e362c0dc) - Shrink bundles that use `HotkeyRecorder` without `HotkeyManager`. The recorder's opt-in conflict check no longer bundles the manager, so a recorder-only bundle drops from about 9.4 kB to 6.2 kB (minified and brotlied). `findHotkeyConflicts` no longer creates the manager when none exists. `normalizeKeyName` now resolves key aliases in any case (`'ESC'` → `'Escape'`). `isModifierKey` returns `false` for `Object.prototype` names such as `'constructor'`.

## 0.15.0

### Minor Changes

- [#184](https://github.com/TanStack/hotkeys/pull/184) [`d7a7e81`](https://github.com/TanStack/hotkeys/commit/d7a7e819db345228f2955729a32d7fc18f8267d4) - A key that continues or completes a sequence in progress no longer runs chords for the same key. With a `C` chord and a `G` then `C` sequence registered, pressing `G` and then `C` runs only the sequence. Chords on a sequence's first step still run.

## 0.14.0

### Minor Changes

- [#167](https://github.com/TanStack/hotkeys/pull/167) [`f8f02f0`](https://github.com/TanStack/hotkeys/commit/f8f02f01e17d62f4323357d30f4b9ae50f797a88) - Add `capture: true` for hotkeys, including sequences, to handle shortcuts before descendant widgets consume them. Capture defaults to false and supports runtime updates while preserving registration state. App hotkeys can declare it, and framework adapters inherit the option, including provider defaults.

  Key-state tracking now listens in the capture phase on `window`, so a capture hotkey on `window` can no longer hide keys from it. If an earlier callback unregisters another hotkey that matches the same key press, the unregistered hotkey no longer fires.

### Patch Changes

- [#161](https://github.com/TanStack/hotkeys/pull/161) [`a9b29f5`](https://github.com/TanStack/hotkeys/commit/a9b29f511faf33ecaa416b5137f4e66af1d44c06) - Recover stale held modifier keys when a system shortcut swallows their keyup without blurring the window. The next real keyboard or mouse event releases any modifier it reports as up. Events dispatched by page code are ignored for this, so they can't clear keys the user is still holding.

## 0.13.0

### Minor Changes

- [#163](https://github.com/TanStack/hotkeys/pull/163) [`3b7c92f`](https://github.com/TanStack/hotkeys/commit/3b7c92f1ed814c0d3ae744b29b04c2ba92c47607) - Let focused controls keep their own keys when `ignoreInputs` is on. Hotkeys now skip Enter and Space on buttons and `<summary>`, Enter on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, trees, and grids, for any target that contains the focused control. A hotkey targeted at the control itself, or `ignoreInputs: false`, still receives these keys. The hotkey recorder now only skips text fields, so it can record Enter and Space while its button has focus.

  `ignoreInputs` now accepts `'auto'`, which is the default and chooses from the hotkey as before. Registered options keep `'auto'` instead of a resolved boolean, and `setOptions({ ignoreInputs: 'auto' })` or `undefined` restores the automatic default.

### Patch Changes

- [#140](https://github.com/TanStack/hotkeys/pull/140) [`c2ee2e4`](https://github.com/TanStack/hotkeys/commit/c2ee2e428e0c3cb8a9e5f56ec519e1db267c1ccc) - fix: support hotkey targets in same-origin iframes and popup windows. Hotkeys targeting another frame's document, window, or element now fire, and typing in that frame's inputs is ignored.

## 0.12.1

### Patch Changes

- [#177](https://github.com/TanStack/hotkeys/pull/177) [`575dc91`](https://github.com/TanStack/hotkeys/commit/575dc912dad2efca59175e18aa877eb0996d17bc) - Do not match a hotkey through the physical key when AltGraph produced the character. For example, German AltGr+M typing `µ` no longer fires `M` or `[KeyM]`.

## 0.12.0

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

## 0.11.0

### Minor Changes

- [#165](https://github.com/TanStack/hotkeys/pull/165) [`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a) - Add Alpine, Ember, and Octane adapters with framework-native lifecycle management, scoped defaults, and shared registration reconciliation.

  Support reactive option getters and live recorder options. Follow replacement provider defaults in Solid and Vue, track getters in Ember definitions, and refresh Lit registrations and scoped targets after host updates.

  Add Ember `onHotkey` and `onHotkeys` modifiers for element-scoped shortcuts with reactive options and automatic cleanup.

  Add Angular and Svelte Hotkeys devtools integrations with development-only defaults and explicit production exports.

  Update compatible dependencies and release all Hotkeys adapters and devtools packages together as minor versions.

## 0.10.1

### Patch Changes

- [#159](https://github.com/TanStack/hotkeys/pull/159) [`faddbfc`](https://github.com/TanStack/hotkeys/commit/faddbfc7bdd98b809f086304f88ff95a848d92be) - Display macOS shortcut modifiers in Control, Option, Shift, Command order without changing normalized binding identities.

## 0.10.0

### Minor Changes

- [#157](https://github.com/TanStack/hotkeys/pull/157) [`ce6e271`](https://github.com/TanStack/hotkeys/commit/ce6e271d7fbf8cc3382bde634b93180127cb44b9) - Publish ES2022 ESM-only packages with a Node.js 20 minimum, matching TanStack Table v9. CommonJS builds, package `src` directories, and source maps are no longer published. Use ESM imports and inspect the declarations in `dist` for installed API types.

  Expose the existing Solid devtools production entry with TypeScript declarations.

  Update framework, store, devtools, and build dependencies while retaining TypeScript 6.0.3. Adapt devtools styling to the new `createTheme` API. Upgrade `@tanstack/preact-store` to 0.13.3, which fixes stale hint updates when shortcut bindings change.

## 0.9.0

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

## 0.8.0

### Minor Changes

- feat: upgrade to latest tanstack store version ([`3104ee4`](https://github.com/TanStack/hotkeys/commit/3104ee494edd9877249c46b648af27d31cfd8c9c))

## 0.7.1

### Patch Changes

- fix: normalizeKeyName null check ([#98](https://github.com/TanStack/hotkeys/pull/98))

## 0.7.0

### Minor Changes

- feat: options.meta with name and descriptions by default and new useHotkeysRegistrations hooks ([#95](https://github.com/TanStack/hotkeys/pull/95))

## 0.6.4

### Patch Changes

- Add `@tanstack/lit-hotkeys` package with Lit reactive controllers and decorators for hotkeys, hotkey sequences, key hold, held keys, hotkey recording, and sequence recording. Also fix input element detection inside shadow DOMs in the core hotkeys package. ([#59](https://github.com/TanStack/hotkeys/pull/59))

## 0.6.3

### Patch Changes

- Add `separatorToken` option to `formatForDisplay` to allow customizing the separator between keys ([#92](https://github.com/TanStack/hotkeys/pull/92))

## 0.6.2

### Patch Changes

- fix: use `document.activeElement` instead of `event.target` for `ignoreInputs` option ([#89](https://github.com/TanStack/hotkeys/pull/89))

  Switched from checking `event.target` to checking `document.activeElement` when determining if hotkeys should be ignored in input elements. This more accurately reflects whether the user is currently typing in an input, and fixes issues with libraries that intercept and re-dispatch keyboard events.

## 0.6.1

### Patch Changes

- chore: upgrade tanstack store version ([`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb))

## 0.6.0

### Minor Changes

- Refactor hotkey normalization and display formatting APIs in `@tanstack/hotkeys`, align framework packages and devtools, and update display-related constants. ([#85](https://github.com/TanStack/hotkeys/pull/85))

## 0.5.0

### Minor Changes

- Align sequence recording with hotkey-prefixed public API: `HotkeySequenceRecorder`, framework hooks `useHotkeySequenceRecorder` / `createHotkeySequenceRecorder` / `injectHotkeySequenceRecorder`, and provider defaults under `hotkeySequenceRecorder`. ([#78](https://github.com/TanStack/hotkeys/pull/78))

## 0.4.3

### Patch Changes

- Fix useHotkeySequence resets progress when modifier key is pressed before a key combo e.g. zA (Vim-like hotkeys) ([#74](https://github.com/TanStack/hotkeys/pull/74))

- fix: add jsdoc for combos in hotkey sequences ([`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c))

## 0.4.2

### Patch Changes

- Fix Alt+punctuation hotkeys not firing on macOS due to Option key character composition ([#64](https://github.com/TanStack/hotkeys/pull/64))

  On macOS, the Option (Alt) key acts as a character composer for punctuation keys (e.g., Option+- produces an en-dash '–'), causing `event.key` to differ from the expected character. Added an `event.code` fallback for punctuation keys (Minus, Equal, Slash, BracketLeft, BracketRight, Backslash, Comma, Period, Backquote, Semicolon), matching the existing fallback pattern for letter and digit keys.

## 0.4.1

### Patch Changes

- fix: option+letter combos on mac layouts ([#61](https://github.com/TanStack/hotkeys/pull/61))

## 0.4.0

### Minor Changes

- add angular adapter and upgrade packages ([#31](https://github.com/TanStack/hotkeys/pull/31))

## 0.3.3

### Patch Changes

- fix: respect keyboard layout in event.code fallback for non-QWERTY layouts ([#53](https://github.com/TanStack/hotkeys/pull/53))

  The `matchesKeyboardEvent` function's `event.code` fallback now only activates when `event.key` is not a standard ASCII letter. Previously, the fallback would match based on physical key position even when `event.key` was a valid letter from a non-QWERTY layout (Dvorak, Colemak, AZERTY, etc.), causing hotkeys to trigger on wrong key presses.

## 0.3.2

### Patch Changes

- fix(isInputElement): recognize contenteditable="plaintext-only" and inherited contenteditable ([#51](https://github.com/TanStack/hotkeys/pull/51))

## 0.3.1

### Patch Changes

- fix: handle dead keys in `matchesKeyboardEvent` ([#40](https://github.com/TanStack/hotkeys/pull/40))

  When `event.key` is `'Dead'` (length 4), the existing `event.code` fallback—gated behind `eventKey.length === 1`—was never reached, causing hotkeys to silently fail.

  This most commonly affects macOS, where `Option+letter` combinations like `Option+E`, `Option+I`, `Option+U`, and `Option+N` produce dead keys for accent composition. It also affects Windows and Linux users with international keyboard layouts (e.g., US-International, German, French) where certain key combinations produce dead keys.

  Added an early check: when `event.key` normalizes to `'Dead'`, immediately fall back to `event.code` to extract the physical key via the `Key*`/`Digit*` prefixes. Punctuation dead keys (e.g., `'` on US-International, where `event.code` is `'Quote'`) correctly return `false` since their codes don't match letter or digit patterns.

## 0.3.0

### Minor Changes

- feat: overhaul sequence-manager and hooks to be in feature parity with hotkey-manager. ([#21](https://github.com/TanStack/hotkeys/pull/21))

## 0.2.0

### Minor Changes

- feat: upgrade tanstack store version ([#35](https://github.com/TanStack/hotkeys/pull/35))

## 0.1.3

### Patch Changes

- fix: hotkeys not triggering on Brave browser when target is `document` or `window` ([#20](https://github.com/TanStack/hotkeys/pull/20))

  Hotkeys registered on `document` or `window` were not being triggered on Brave browser due to non-standard `event.currentTarget` behavior. Brave sets `currentTarget` to `document.documentElement` instead of `document` when a listener is attached to `document`, likely due to privacy/fingerprinting protections.

  Updated `#isEventForTarget` to accept both `document` and `document.documentElement` as valid `currentTarget` values for cross-browser compatibility.

## 0.1.2

### Patch Changes

- Fix SSR fallback issue in HotkeyManager.register() - return a no-op handle instead of creating a fake Document object when running in SSR environments ([#15](https://github.com/TanStack/hotkeys/pull/15))

## 0.1.1

### Patch Changes

- fix detectPlatform SSR pass on WinterTC runtime with partial navigator implementation (e.g: Deno, Cloudflare workers) ([#14](https://github.com/TanStack/hotkeys/pull/14))

## 0.1.0

### Minor Changes

- feat: smarter ignoreInputs default ([#10](https://github.com/TanStack/hotkeys/pull/10))

## 0.0.2

### Patch Changes

- feat: initial release ([`341d167`](https://github.com/TanStack/hotkeys/commit/341d16731f09709a463343852ae4c0e1b6bc6613))

## 0.0.1

### Patch Changes

- feat: TanStack Hotkeys ([#5](https://github.com/TanStack/hotkeys/pull/5))
