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
---

Add `formatForAria` to format hotkeys for the `aria-keyshortcuts` attribute. `formatForAria('Mod+K')` returns `'Meta+K'` on macOS and `'Control+K'` elsewhere. Modifiers and keys follow the ARIA specification, using `Space` for the space bar, `Plus` for the plus key, and the key at that position for physical bindings. `formatForAria` returns `undefined` for multi-step sequences, standalone modifiers, empty hotkeys, and physical codes with no key value so the attribute is omitted.

Each framework adapter exports a formatter that fills in the configured platform and the user's keyboard layout:

- `useFormatForAria` (React, Preact, Octane, Vue, Ember)
- `createFormatForAria` (Solid, and on Alpine scopes)
- `getFormatForAria` (Svelte)
- `injectFormatForAria` (Angular)
- `FormatForAriaController` (Lit)
