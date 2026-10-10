---
'@tanstack/hotkeys': patch
---

Do not match a hotkey through the physical-key fallback when AltGraph produced the character (for example German AltGr+M typing `µ` no longer fires `M`).
