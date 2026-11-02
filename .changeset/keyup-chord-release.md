---
'@tanstack/hotkeys': minor
---

Fire a keyup chord when the user releases its key or one of its modifiers, whichever comes first. Before, releasing the modifier first meant the chord never fired, and on macOS a keyup `Mod` chord never fired at all, because macOS sends no keyup for a key released while Command is held.

A keyup chord now also prevents its keydown's default action, so a keyup `Mod+S` stops the browser's Save dialog. Set `preventDefault: false` to let the browser act on the keydown.
