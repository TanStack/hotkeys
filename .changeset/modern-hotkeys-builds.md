---
'@tanstack/angular-hotkeys': minor
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': major
'@tanstack/lit-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/preact-hotkeys-devtools': minor
'@tanstack/react-hotkeys': minor
'@tanstack/react-hotkeys-devtools': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/solid-hotkeys-devtools': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/vue-hotkeys-devtools': minor
---

Publish ES2022 ESM-only packages with a Node.js 20 minimum, matching TanStack Table v9. CommonJS builds, package `src` directories, and source maps are no longer published. Use ESM imports and inspect the declarations in `dist` for installed API types.

Expose the existing Solid devtools production entry with TypeScript declarations.

Update framework, store, devtools, and build dependencies while retaining TypeScript 6.0.3. Adapt devtools styling to the new `createTheme` API. Keep `@tanstack/preact-store` pinned to 0.13.0 to preserve hint updates when shortcut bindings change.
