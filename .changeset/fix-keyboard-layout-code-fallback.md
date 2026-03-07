---
'@tanstack/hotkeys': patch
---

fix: respect keyboard layout in event.code fallback for non-QWERTY layouts

The `matchesKeyboardEvent` function's `event.code` fallback now only activates when `event.key` is not a standard ASCII letter. Previously, the fallback would match based on physical key position even when `event.key` was a valid letter from a non-QWERTY layout (Dvorak, Colemak, AZERTY, etc.), causing hotkeys to trigger on wrong key presses.
