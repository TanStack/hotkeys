---
'@tanstack/lit-hotkeys': minor
---

Add `dispose()` to every Lit controller. It releases the controller right away and removes it from its host. Use it to remove one hotkey from a list that changes. Lit's `removeController` doesn't call `hostDisconnected`, so it alone still leaves a controller active: a `HotkeyController` removed that way stays registered, even after its host disconnects. Call `dispose()` instead.
