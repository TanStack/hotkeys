---
'@tanstack/hotkeys': patch
---

A key press that the browser reports as `Unidentified` but with a usable `event.code` now fires hotkeys. Chrome on Linux Wayland reports Ctrl+Backquote this way, so ``Control+` `` and `Control+[Backquote]` never fired there. Such a press was treated as IME composition. It now counts as a normal key press: physical bindings match its code, and logical bindings fall back to its position as they do for dead keys, except on letter keys, which layouts such as AZERTY rearrange. `Unidentified` presses without a usable code, or with `keyCode` 229 as Android keyboards send while composing, are still ignored. The recorder records such a press by its code, and skips it in key mode.
