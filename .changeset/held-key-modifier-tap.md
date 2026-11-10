---
'@tanstack/hotkeys': minor
---

The held-key tracker no longer forgets held keys when a modifier is tapped. Before, releasing Shift, Control, Alt, or Meta cleared every held non-modifier key, so holding W and tapping Shift dropped W from `getHeldKeys()` and every adapter's held-key helpers. Now only releasing Command on macOS clears them, because macOS swallows the keyup of a key pressed with Command, such as S after Cmd+S.
