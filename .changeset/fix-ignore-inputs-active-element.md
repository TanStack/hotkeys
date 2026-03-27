---
'@tanstack/hotkeys': patch
---

fix: use `document.activeElement` instead of `event.target` for `ignoreInputs` option

Switched from checking `event.target` to checking `document.activeElement` when determining if hotkeys should be ignored in input elements. This more accurately reflects whether the user is currently typing in an input, and fixes issues with libraries that intercept and re-dispatch keyboard events.
