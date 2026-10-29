---
'@tanstack/preact-hotkeys': patch
'@tanstack/preact-hotkeys-devtools': patch
'@tanstack/solid-hotkeys-devtools': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/svelte-hotkeys-devtools': patch
'@tanstack/alpine-hotkeys': patch
'@tanstack/octane-hotkeys': patch
---

Fix framework peer ranges so they match the versions each package builds and runs on:

- Preact `>=10.5.2`. Older releases can't resolve `preact/jsx-runtime`.
- Solid devtools `^1.9.15`. The panel crashes below 1.9.15, where two copies of Solid get installed.
- Vue `>=3.3.0`. The adapter uses `toValue`, added in Vue 3.3.
- Svelte `^5.40.0`. The adapter uses `createContext`, added in Svelte 5.40.
- Alpine `^3.13.0`, down from `^3.15.12`. npm no longer refuses to install the adapter next to Alpine 3.13 and 3.14.
- Octane `>=0.12.0 <1.0.0 || >=1.0.4`, which excludes `octane` 1.0.0 to 1.0.3, an unrelated package from 2015.
