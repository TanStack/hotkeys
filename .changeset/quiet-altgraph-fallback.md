---
'@tanstack/hotkeys': patch
---

Do not match a hotkey through the physical key when AltGraph produced the character. For example, German AltGr+M typing `µ` no longer fires `M` or `[KeyM]`.
