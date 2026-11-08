---
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/solid-hotkeys-devtools': patch
'@tanstack/vue-hotkeys-devtools': patch
---

The `/production` entry now renders the devtools panel in production builds. Its panel loaded the core from the root `@tanstack/hotkeys-devtools` entry, which switches to a no-op outside development, so the panel rendered nothing. It now loads the core from `@tanstack/hotkeys-devtools/production`, as the Angular and Svelte adapters do. The default entry still returns no-ops outside development.
