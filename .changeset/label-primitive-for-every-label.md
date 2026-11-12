---
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

Each adapter's label primitive is now the way to format every label, and the plain `formatForDisplay` export of each adapter is deprecated. The primitive fills in the provider's platform and, in Chromium browsers, the user's keyboard layout, so it is no longer only for server-rendered apps.

- In components, replace `formatForDisplay(hotkey)` with the function from the label primitive, such as `const formatForDisplay = useFormatForDisplay()`. The primitive is `useFormatForDisplay` in React, Preact, Octane, Vue and Ember, `createFormatForDisplay` in Solid, `getFormatForDisplay` in Svelte, and `injectFormatForDisplay` in Angular.
- Lit and Alpine get a label primitive. In Lit, `new FormatForDisplayController(host, options?)` has a `format` function. In Alpine, a scope's `createFormatForDisplay()` returns the function, and `createHotkeysScope` takes a default `platform` for labels, hotkeys and recorders, as the other adapters' providers do.
- The deprecated export is still the core function and still works. Outside a component, such as in a test or a plain module, keep calling it and pass `platform` yourself.
- The guides, skills and examples of every framework now use the label primitive.
