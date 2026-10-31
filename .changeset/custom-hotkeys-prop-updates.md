---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/angular-hotkeys': minor
---

`HotkeysProvider` now applies a changed `customHotkeys` prop. Before, the provider read it only on the first render, so saved shortcuts that loaded asynchronously, or another user's shortcuts after sign-in, were ignored until the provider remounted.

- When the value of `customHotkeys` changes, it replaces the current custom hotkeys without calling `onCustomHotkeysChange`. The prop is compared by value, so passing equal data again, such as `JSON.parse(localStorage.getItem('hotkeys'))` on every render, keeps changes the user made since. `undefined` leaves the custom hotkeys unchanged, such as while saved data loads, and `null` clears them, such as on sign-out.
- `AppHotkeysStore.setOptions` accepts `customHotkeys` with the same behavior. Lit, Alpine, and Ember apps can call it on the store that `provideAppHotkeys` returns when saved data loads later.
- In Angular, `provideHotkeys` accepts `customHotkeys` as a signal or function. In Vue, `provideHotkeysContext` accepts it as a ref or getter.
