---
'@tanstack/hotkeys-devtools': minor
'@tanstack/solid-hotkeys-devtools': minor
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/preact-hotkeys-devtools': patch
'@tanstack/vue-hotkeys-devtools': patch
'@tanstack/svelte-hotkeys-devtools': patch
'@tanstack/angular-hotkeys-devtools': patch
---

Move the devtools panel to Solid 2, `@tanstack/devtools-ui` 0.8, and `@tanstack/devtools-utils` 0.8, the same as TanStack Devtools 0.17. The panel looks and works the same in every framework, and it needs Node 22.12 or newer.

`@tanstack/solid-hotkeys-devtools` now needs `solid-js` 2 and `@tanstack/solid-devtools` 0.9 or newer. Solid 1 apps can stay on `@tanstack/solid-hotkeys-devtools@0.13`.
