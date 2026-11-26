---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/angular-hotkeys': patch
---

A recorder option that a component stops passing, such as a `validate` passed only in a strict mode, now stops applying. Before, the recorder kept the old value, so it kept rejecting recordings. The new `syncRecorderOptions` helper in `@tanstack/hotkeys/adapter` does this for every adapter. Angular already handled this and now uses the same helper.
