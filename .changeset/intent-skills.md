---
'@tanstack/hotkeys': patch
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/angular-hotkeys': patch
'@tanstack/lit-hotkeys': patch
'@tanstack/alpine-hotkeys': patch
'@tanstack/ember-hotkeys': patch
'@tanstack/octane-hotkeys': patch
---

Ship [TanStack Intent](https://tanstack.com/intent) skills with each package, so coding agents use the library's own APIs instead of hand-written keydown listeners and wrappers. `@tanstack/hotkeys` includes `hotkeys-core` and `app-hotkeys`, and each framework package includes a skill for its bindings. List them with `npx @tanstack/intent@latest list`.
