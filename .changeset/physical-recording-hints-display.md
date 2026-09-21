---
'@tanstack/angular-hotkeys': minor
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/preact-hotkeys-devtools': minor
'@tanstack/react-hotkeys': minor
'@tanstack/react-hotkeys-devtools': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/solid-hotkeys-devtools': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/vue-hotkeys-devtools': minor
---

- breaking: `RawHotkey` and `ParsedHotkey` are now unions containing either `key` or `code`. Use type intersections instead of extending them with interfaces.
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
