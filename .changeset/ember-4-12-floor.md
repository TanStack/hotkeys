---
'@tanstack/ember-hotkeys': minor
---

Support Ember 4.12 and newer, including the 4.12 and 5.12 LTS lines and ember-source 6.8.0 to 6.8.2, 6.9.0 and 6.10.0. The adapter tracked its state with `@ember/reactive/collections`, which only newer ember-source versions ship. It now uses `@glimmer/tracking`, which every supported version has.
