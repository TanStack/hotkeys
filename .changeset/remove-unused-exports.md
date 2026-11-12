---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/ember-hotkeys': minor
---

Breaking: these exports are removed from the core package and from every adapter, which re-exports the core. The library never read them.

- The `KeyboardEventMatch` type. It described the matcher's internal result, and no public function returned it.
- The key Sets `LETTER_KEYS`, `NUMBER_KEYS`, `FUNCTION_KEYS`, `NAVIGATION_KEYS`, `EDITING_KEYS`, `PUNCTUATION_KEYS`, and `ALL_KEYS`. The key types, such as `LetterKey` and `FunctionKey`, are unchanged. If you listed keys from one of these Sets, keep your own list.
