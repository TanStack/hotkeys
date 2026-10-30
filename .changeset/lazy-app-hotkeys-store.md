---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/octane-hotkeys': minor
---

Providers no longer bundle app hotkey support unless the app uses `defineAppHotkeys`. A React app with `HotkeysProvider` and no app hotkeys is about 1 kB smaller (brotli).
