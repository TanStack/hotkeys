---
'@tanstack/hotkeys': minor
---

Stop matching a key by its US position when the browser already reports what it typed. On AZERTY, Cmd++ (zoom in) no longer fires `Mod+/`, and on German QWERTZ, Cmd+- (zoom out) no longer fires it either. With NumLock off, the numpad's End and arrow keys no longer fire digit hotkeys.

Behavior change: an ASCII symbol on another key's position (Dvorak's `'` on Q), a Latin letter such as `ü` or `ø` on a punctuation position without Control or Command, and a named key such as `End` now match only themselves. Non-Latin layouts, macOS Option, dead keys, the digit row, and symbols typed with Shift still fall back to the key's position.
