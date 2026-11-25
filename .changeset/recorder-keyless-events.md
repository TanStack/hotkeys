---
'@tanstack/hotkeys': patch
---

The hotkey recorder no longer throws on a `keydown` with no `key` or `code`, which browser autofill and password managers send. It rejects the press with the `missing-code` reason instead. Held-key state also ignores these events, so it no longer shows an empty key or drops a held Shift.
