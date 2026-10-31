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

Hotkey hooks and functions in every adapter accept `undefined` and `null` as the hotkey, for components with an optional shortcut. No hotkey registers nothing, and its hint is `false`. When a hotkey changes to `undefined` or `null`, its registration is removed; when it changes back, it registers again. Before, a nullish hotkey threw: in React it unmounted the tree, in Vue, Solid, Angular, and Svelte the old hotkey kept firing, Ember failed to render, and Alpine stopped updating the page. In Angular, `injectHotkey(() => this.shortcut(), …)` now works with an optional input, without `?? []`.

- The plural forms skip a definition whose `hotkey` is nullish.
- An empty hotkey, such as `''` or `{ key: '' }`, also registers nothing, so clearing a hotkey to `''` removes its registration. Before, an empty hotkey registered and fired on `keydown` events with no key, such as those some autofill tools send.
- `HotkeyManager.register` still requires a hotkey. It throws a clear error for `undefined`, `null`, or an empty hotkey, as it already did for an empty sequence.
- `hasActiveRegistration` and `matchesHeldModifiers` return `false` for no hotkey.
- The Lit `@hotkey` decorator still needs a hotkey, because it is set when the class is defined.
