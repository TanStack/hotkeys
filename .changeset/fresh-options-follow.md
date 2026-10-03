---
'@tanstack/solid-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/lit-hotkeys': minor
'@tanstack/ember-hotkeys': patch
---

Keep reactive options current when Solid and Vue provider defaults are replaced, and track getters inside Ember shortcut and sequence definitions.

Support option getters in Lit controllers, refresh registrations after host updates, and move listeners when scoped targets change. Preserve live recorder getters when updating unrelated options.
