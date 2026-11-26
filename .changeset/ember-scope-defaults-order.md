---
'@tanstack/ember-hotkeys': minor
---

`createHotkeysScope` defaults no longer override an app hotkey's declared options. The helpers and modifiers from a scope put its defaults below the declaration, as the App Hotkeys guide says: scope defaults, then declared options, then call-site options. Before, a scope default such as `preventDefault: true` replaced `preventDefault: false` from `defineAppHotkeys`.
