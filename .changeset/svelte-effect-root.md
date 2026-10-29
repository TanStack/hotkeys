---
'@tanstack/svelte-hotkeys': patch
---

`createHotkey`, `createHotkeys`, and `createHotkeyRecorder` now work inside `$effect.root`, such as shared state in a `.svelte.ts` module. They threw `lifecycle_outside_component` before. They clean up when the root is destroyed, and still clean up when a component is destroyed.
