---
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
---

`HotkeysProvider` now uses `appHotkeys` that arrive after its first render, such as declarations from a lazy import or behind a feature flag. Before, a provider that started without them never created its app hotkeys store, even after they arrived: the user's saved custom hotkeys weren't applied, the app hotkey list and custom hotkey helpers kept throwing, and the devtools listed no declared hotkeys. A component that calls those helpers still has to render after the declarations arrive.
