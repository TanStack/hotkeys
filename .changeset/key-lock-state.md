---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/hotkeys-devtools': minor
---

Track whether Caps Lock, Num Lock, and Scroll Lock are on. `KeyStateTracker` adds `locks` to its store state and a `getKeyLockState(key)` method. Each value is `true`, `false`, or `null`. It stays `null` until the user presses a key, clicks, or moves the mouse, because browsers can't report lock state on page load. It goes back to `null` when the window loses focus or the page is hidden. Num Lock and Scroll Lock are always `null` on macOS and iOS, where browsers don't report them. The tracker reads lock state only from real user input.

Each framework adapter provides a reactive helper for reading lock state:

- `useKeyLockState` (React, Preact, Octane, Vue, Ember)
- `createKeyLockState` (Solid, and on Alpine scopes)
- `getKeyLockState` (Svelte)
- `injectKeyLockState` (Angular)
- `KeyLockStateController` (Lit)

The devtools panel shows each lock as on, off, unknown, or unavailable next to the held keys.
