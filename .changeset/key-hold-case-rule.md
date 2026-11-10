---
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/ember-hotkeys': minor
---

Every key-hold helper now matches keys the way core `isKeyHeld` does: letters match in any case, and other key names are case-sensitive. React, Preact, Solid, Svelte, Angular, Vue, and Lit used to match every name in any case, so `'escape'` was held while Escape was down; now it isn't, so write `'Escape'`. Alpine, Octane, and Ember used to match letters exactly, so `'a'` wasn't held after Shift+A; now it is.
