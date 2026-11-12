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
'@tanstack/octane-hotkeys': minor
'@tanstack/ember-hotkeys': minor
---

Breaking: the hotkey recorder now records a key by name where it has one. Control+S records `Mod+S`, where it recorded `Mod+[KeyS]`. The new default is `recordBy: 'auto'`. Set `recordBy: 'code'` to keep recording every key by position. Saved hotkeys in the old form keep working.

Recording by name fixes three problems with recorded hotkeys:

- **Labels follow the keyboard layout.** On a French AZERTY keyboard, Control and the key labeled A recorded `Mod+[KeyQ]`, which displayed as Ctrl+Q. It now records `Mod+A`.
- **A recorded hotkey equals the same hotkey written by hand.** A recorded `Mod+[KeyS]` and a declared `Mod+S` both fired for Control+S, but compared as different hotkeys. Conflict checks missed the pair, and no duplicate warning was logged.
- **Recording a hotkey's own default no longer marks it as custom**, where the recorder writes the press the way the default is written.

A press with no name that means the same thing on every platform still records by position:

- Shift with a digit or a symbol, such as `Shift+[Slash]`. Windows reports `?` for Control+Shift+/ and macOS reports `/` for Command+Shift+/, so a recorded `?` would not fire on a Mac.
- macOS Option with a digit or a symbol, such as `Alt+[Digit1]`. Option with a letter records the letter on the keycap, such as `Alt+S`.
- Dead keys and the numpad.

A letter from a non-Latin layout records as the key in its position on a US keyboard, the way it matches: Control+ы on a Russian layout records `Mod+S`. A key press with no physical code is now recorded by what it typed. It was rejected with `'missing-code'`.
