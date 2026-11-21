---
'@tanstack/hotkeys': patch
---

A key that types a letter with a mark, such as `שׁ` on macOS Hebrew Shift+A, now fires the hotkey for its position, as other non-Latin letters do. The matcher treated any key value longer than one code point as a named key like `End`, so `Shift+A`, `Shift+C`, `Alt+H` and the other pointed-letter presses on the macOS Hebrew layouts fired nothing. AltGr typing such a letter now counts as typing a character too.
