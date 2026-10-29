---
'@tanstack/vue-hotkeys-devtools': patch
---

Fix `HotkeysDevtoolsPanel`, which threw `Cannot read properties of undefined (reading 'color')` and rendered nothing, both on its own and inside `TanStackDevtools` from `@tanstack/vue-devtools`. The panel now defaults `theme` to `'dark'` and `devtoolsOpen` to `true`, reads the props the Vue devtools dock passes, and remounts when the theme changes.

The package no longer depends on `@tanstack/devtools-utils`, and its `vue` peer is now `>=3.3.0`, matching `@tanstack/vue-hotkeys`.
