---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/hotkeys-devtools': minor
---

Add hotkey scopes, which turn groups of hotkeys on and off together, such as everything in a dialog.

- Every hotkey belongs to a scope. The default scope, `'global'`, is always active. Pass `scope` to a hotkey to put it in another scope.
- `HotkeyManager.activateScope(scope, options)` activates a scope until you call the function it returns. When hotkeys in two active scopes match the same key, a nested scope beats the scopes around it, and otherwise the most recently activated scope wins.
- An exclusive scope suspends every other scope, including `'global'`, while it's active. Pass `exclusive: { allow: ['global'] }` to keep some scopes working.
- `HotkeyManager.scopes` publishes which scopes are active, suspended, allowed, and exclusive. `isScopeActive(scope)` reports whether a scope's hotkeys can fire.
- In React, Preact, Solid, Vue, Svelte, and Octane, `HotkeysProvider` takes `scope`, `exclusive`, and `enabled`. Hotkeys registered inside a scoped provider belong to its scope, which is active while the provider is mounted and enabled. Vue's `provideHotkeysContext` and Svelte's `setHotkeysContext` take the same options. In Angular, pass them to `provideHotkeys` in a component's `providers`.
- In Lit, Alpine, and Ember, activate scopes with the hotkey manager, and pass `scope` to the hotkeys that belong to them.
- App hotkeys can declare a `scope`. App hotkeys in different scopes can share a hotkey without a conflict. The app hotkey list reports `'suspended'` for an app hotkey whose enabled registrations are all in inactive scopes.
- Devtools group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.
