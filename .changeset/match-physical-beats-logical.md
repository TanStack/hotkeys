---
'@tanstack/hotkeys': minor
---

When a logical and a physical hotkey on the same target and phase both match a key press exactly, in the same scope, only the physical one fires. Numpad Enter now fires `[NumpadEnter]` and not `Enter` as well, and `[KeyS]` registered next to `S` fires alone. Before, both fired on one press.
