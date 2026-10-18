---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/hotkeys-devtools': patch
---

Types and functions now follow one naming rule: a hotkey is a chord or a sequence, a chord is keys pressed together, and a sequence is chords pressed one after another. A name with `Hotkey` alone accepts both kinds. Names for one kind say `Chord` or `Sequence`.

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
