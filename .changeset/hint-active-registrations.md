---
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/octane-hotkeys': minor
---

Hotkey hints now show only for hotkeys that can fire. `useHotkeyHint` and the other adapters' hint helpers return `false` unless a registration of the hotkey is enabled and in an active scope. Hotkeys registered with `enabled: false`, hotkeys suspended by an exclusive scope, and hotkeys that nothing registered no longer show hints. App hotkeys match their registrations by id, so custom hotkeys still work. Hints still don't check focus or a registration's `target`. To keep the old behavior, call `matchesHeldModifiers`, which still checks only held keys. The new `HotkeyManager.hasActiveRegistration(hotkey)` reports whether a hotkey or app hotkey has an enabled registration in an active scope.

Add `preventDefault: 'always'`. A chord with this option still prevents the browser's action while it can't fire, because it's disabled or its scope is inactive or suspended. For example, a disabled `Mod+S` no longer opens the browser's Save dialog. It doesn't stop propagation, and it still skips typing in text fields. When another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. Set it in default options to apply it to every hotkey. We recommend it for most hotkeys; the sensible defaults guide explains when to leave it off, such as for `Mod+C` or `Tab` hotkeys you turn off to hand the key back to the browser. Devtools show `always` for these hotkeys.

Registration views now have a `status`: `'active'` when the hotkey can fire, `'suspended'` when its scope is inactive or suspended by an exclusive scope, and `'disabled'` when it has `enabled: false`. To list only the hotkeys that can fire, filter by `status === 'active'` instead of checking `enabled` and `isScopeActive` yourself.

Each adapter has a new API that reads the hotkey manager's scope state and updates when scopes activate or release: `useHotkeyScopesState` in React, Preact, Vue, Ember, and Octane, `createHotkeyScopesState` in Solid and on Alpine's `createHotkeysScope` owner, `injectHotkeyScopesState` in Angular, `getHotkeyScopesState` in Svelte, and `HotkeyScopesStateController` in Lit.
