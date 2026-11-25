---
'@tanstack/hotkeys': patch
---

`º`, `ª` and `ℓ` no longer fire `O`, `A` and `L` hotkeys. Key comparison now folds case only, instead of using an `Intl.Collator` that also treated these symbols as letters. This affects Spanish and Portuguese `º`, macOS Option+0 and Option+9, and AltGr+Shift+F and AltGr+Shift+M on many Linux layouts.
