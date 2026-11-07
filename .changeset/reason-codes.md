---
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': minor
'@tanstack/alpine-hotkeys': patch
'@tanstack/angular-hotkeys': patch
'@tanstack/ember-hotkeys': patch
'@tanstack/lit-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/react-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/vue-hotkeys': patch
---

`validateHotkey` and the recorder now return reason codes instead of English text, so apps write their own messages. Each error and warning from `validateHotkey` is a `HotkeyIssue` such as `{ reason: 'unknown-modifier', part: 'Ctl' }`, and issues in a sequence carry the index of their `step` instead of a `Step 2:` prefix. A `RecorderRejection` keeps its `reason` but no longer has a built-in `message`. It has a `message` only when your `validate` callback returns one. The `'invalid'` rejection reason is now `'whitespace'`. The devtools panel lists each problem in a hotkey's details, in plain words. Console warnings and thrown errors are now one short line that starts with `[hotkeys]`. App hotkeys no longer warn about saved custom hotkeys with an unknown id or an invalid value; they're still dropped. `setCustomHotkey` with an unknown id no longer warns either. Development warnings no longer throw a `ReferenceError` where `process` is undefined, such as plain ESM loaded from a CDN.
