---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/angular-hotkeys': patch
'@tanstack/alpine-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/ember-hotkeys': patch
'@tanstack/lit-hotkeys': patch
---

An option set to `undefined` now keeps its default, the same as leaving it out. Before, a wrapper component that forwarded unset props, such as `preventDefault: props.preventDefault`, turned off `preventDefault` and `stopPropagation`, so `Mod+S` also opened the browser's Save dialog. `eventType: undefined` made a hotkey never fire, and `scope: undefined` moved a hotkey out of its provider's scope.

- This applies to `register`, provider defaults, `createHotkeysScope` defaults in Alpine and Ember, and recorder options merged with provider defaults.
- In `setOptions`, `undefined` resets an option to its default, or removes it when it has no default.

Behavior changes:

- In React and Preact, a `null` target registers nothing, like a ref that is still empty. Before, it listened on `document`. To listen on `document`, leave out `target`. `prepareHotkeyDefinitions` in `@tanstack/hotkeys/adapter` does the same when no `resolveTarget` is given, which also applies to Svelte. Vue, Solid, Angular, Lit, Alpine, Ember, and Octane already skipped a `null` target.
