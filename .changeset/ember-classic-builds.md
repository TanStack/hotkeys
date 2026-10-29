---
'@tanstack/ember-hotkeys': patch
---

Fix classic ember-cli apps that load the addon through ember-auto-import. The package now has the `ember-addon` keyword and no longer sets `"type": "module"`, which made webpack load the whole module object for default imports such as `@ember/component/helper`. `ember-modifier` is now a caret range, so an app that already has ember-modifier 4.3 installs one copy instead of two.

The `ember-source` peer range is now `>=6.8.3 <6.9.0 || >=6.10.1`. Classic builds of 6.8.0 to 6.8.2, 6.9.0 and 6.10.0 don't include `@ember/reactive/collections`, which the adapter imports.
