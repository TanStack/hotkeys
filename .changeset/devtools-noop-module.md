---
'@tanstack/hotkeys-devtools': patch
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/preact-hotkeys-devtools': patch
'@tanstack/solid-hotkeys-devtools': patch
'@tanstack/vue-hotkeys-devtools': patch
'@tanstack/svelte-hotkeys-devtools': patch
'@tanstack/angular-hotkeys-devtools': patch
---

Production builds no longer bundle the devtools panel's JavaScript. The default entry's no-op panel and plugin now live in their own module, so bundlers drop the real panel, the devtools core and the Solid runtime when `NODE_ENV` is not `development`. With the documented React setup, that removes about 2.7 kB gzip under Vite and about 53 kB gzip under esbuild.
