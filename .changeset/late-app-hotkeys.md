---
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
---

`HotkeysProvider` now uses `appHotkeys` that arrive after its first render, such as declarations from a lazy import or behind a feature flag. Before, a provider that started without them never created its app hotkeys store: the user's saved custom hotkeys weren't applied, the app hotkey list and custom hotkey helpers threw, and the devtools listed no declared hotkeys.
