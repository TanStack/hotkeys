---
'@tanstack/hotkeys': patch
---

A dead key pressed alone no longer fires the US key at its position, except on a letter key, on the digit row, or on the US `'` and `` ` `` keys, where US International puts its accents. Swiss German `^` on the US `=` key no longer fires `=`. With Control, Alt or Command held, a dead key still matches by position.
