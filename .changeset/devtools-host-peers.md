---
'@tanstack/hotkeys-devtools': minor
'@tanstack/react-hotkeys-devtools': minor
'@tanstack/preact-hotkeys-devtools': minor
'@tanstack/solid-hotkeys-devtools': minor
'@tanstack/vue-hotkeys-devtools': minor
'@tanstack/svelte-hotkeys-devtools': minor
'@tanstack/angular-hotkeys-devtools': minor
---

Each devtools adapter now lists its TanStack Devtools host as an optional peer dependency at the current release, such as `@tanstack/react-devtools` 0.10.14. Older hosts pass the plugin a theme string instead of props, so the panel ignored the theme, and TypeScript rejects the React plugin since `@tanstack/react-hotkeys-devtools` 0.12.0. Package managers now warn about an old host at install time.

Update `@tanstack/devtools-utils` and `@tanstack/devtools-ui` to 0.7.2. The Preact panel now unmounts its core on Preact 11 (TanStack/devtools#551).
