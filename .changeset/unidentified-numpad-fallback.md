---
'@tanstack/hotkeys': patch
---

A numpad key that the browser reports as `Unidentified` no longer fires its digit or operator. In Firefox, numpad 5 with NumLock off fired a `5` hotkey; now only `[Numpad5]` matches, as in Chromium.
