---
'@tanstack/hotkeys': minor
---

`cancel()` on a recorder that isn't recording does nothing. Before, it called `onCancel` and cleared the last recorded hotkey, so a Cancel button or a click-outside handler that ran while idle called the app's `onCancel` with nothing to cancel.
