---
'@tanstack/hotkeys-devtools': patch
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/preact-hotkeys-devtools': patch
'@tanstack/solid-hotkeys-devtools': patch
'@tanstack/vue-hotkeys-devtools': patch
'@tanstack/svelte-hotkeys-devtools': patch
'@tanstack/angular-hotkeys-devtools': patch
---

Fix type errors in the devtools packages with `skipLibCheck: false`. Their declarations used types from `@tanstack/devtools-utils`, which import `@tanstack/devtools` without depending on it, so TypeScript reported `Cannot find module '@tanstack/devtools'`, and with `skipLibCheck: true` the panel props became `any`. The packages now declare their own panel and plugin types. `@tanstack/hotkeys-devtools` exports `HotkeysDevtoolsPanelProps`, `HotkeysDevtoolsTheme` and `HotkeysDevtoolsCoreClass`.

The React devtools types no longer refer to `JSX` from `react`, which some `@types/react` 18 releases don't export.
