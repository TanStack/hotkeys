---
'@tanstack/hotkeys': patch
---

`formatForDisplay` now labels the extra ISO and JIS keys with their keycap legends when no layout map is passed: `[IntlBackslash]` and `[IntlRo]` show `\` and `[IntlYen]` shows `¥`, instead of their code names. A layout map entry still wins.
