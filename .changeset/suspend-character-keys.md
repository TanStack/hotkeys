---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/hotkeys-devtools': patch
---

Add `HotkeyManager.suspendCharacterKeys()` and the `suspendCharacterKeys` provider option so apps can let users turn off character key shortcuts for WCAG 2.1.4.

A character key shortcut is a document-level hotkey whose every step types a character, alone or with `Shift`, such as `'K'`, `'?'`, `'Shift+K'`, `'Space'`, or `['G', 'H']`. While suspended, those hotkeys do not fire and report the status `'suspended'`. Hotkeys with `Control`, `Alt`, or `Meta`, non-character keys such as `Escape` or `F1`, and hotkeys targeted at an element keep working.

Suspensions are counted like scope activations, and `HotkeyScopesState` now includes `characterKeysSuspended`. Bind the provider option to a user setting with `<HotkeysProvider suspendCharacterKeys={!settings.characterKeyShortcuts}>` (or `provideHotkeys({ suspendCharacterKeys })` in Angular).
