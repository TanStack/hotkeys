---
'@tanstack/hotkeys': minor
---

A symbol that US Shift types on a punctuation key now stands for that US key on every layout. `Shift+/` means `?` and `Shift+-` means `_`, wherever the layout puts them. On German QWERTZ, `Shift+ß` (which types `?`) now fires `Shift+/` instead of `Shift+-`, and the key that types `_` fires `Shift+-`. On AZERTY, `Shift+,` types `?` and fires `Shift+/` instead of `Shift+M`. Nothing changes on a US layout. One trade-off: on German, Swiss, Spanish, Italian and Portuguese layouts, `Shift+.` types `:`, so it now fires `Shift+;` instead of `Shift+.`. Other layouts follow the same rule: UK `Shift+#` types `~` and fires ``Shift+` ``, and German `Shift+<` types `>` and fires `Shift+.`. Symbols US Shift doesn't type, such as UK `Shift+'` typing `@`, keep the key's position.
