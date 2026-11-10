---
'@tanstack/hotkeys': patch
---

The recorder with `recordBy: 'code'` now ignores a key on a modifier position, as it ignores modifier keys. Before, with Control and Caps Lock swapped, pressing Caps Lock recorded `[ControlLeft]`, a hotkey that registers nothing.
