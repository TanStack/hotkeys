---
'@tanstack/svelte-hotkeys': patch
---

A nested `HotkeysProvider` no longer changes its parent's app hotkeys. Before, a nested provider that got its own `appHotkeys` after it rendered replaced the parent's declarations and dropped the parent's custom hotkeys. It now gets its own store.
