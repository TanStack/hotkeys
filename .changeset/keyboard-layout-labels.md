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
'@tanstack/hotkeys-devtools': minor
---

Labels of physical bindings now follow the user's keyboard layout where the browser reports it. `[KeyQ]` displayed as `Q`, the key's US character. It now displays as `A` on a French AZERTY keyboard in Chromium browsers. Firefox and Safari report no layout, so labels keep their US form there.

- Each adapter's label primitive, such as `useFormatForDisplay`, loads the layout after the first label mounts and uses it. Server-rendered labels hydrate with the US form and update when the layout arrives. `formatForDisplay` called directly is unchanged: it uses only a `layoutMap` you pass.
- A new layout primitive in every adapter, such as `useKeyboardLayout`, returns the layout for labels you draw yourself. Lit and Alpine have no label primitive, so pass its value to `formatForDisplay` as `layoutMap`.
- `loadKeyboardLayout()` loads the layout with `navigator.keyboard.getLayoutMap()` and reads it again when the window regains focus. `getKeyboardLayoutStore()` holds the result. Use them without an adapter.
- To never ask the browser for the layout, set `keyboardLayout: false` in the provider's default options, or in the scope's options in Alpine and Ember.
- Devtools show the loaded layout, and mark the keys it relabels.

Matching and recording never use the layout. Providers don't import the loader, so an app that registers hotkeys and never formats a label or reads the layout doesn't bundle it. Alpine scopes carry every primitive, the layout one included.
