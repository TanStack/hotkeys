---
'@tanstack/hotkeys': minor
---

Hotkey strings can accept the keys of other keyboard layouts. Register the layouts your app targets with `keys` on the `Register` interface, such as `keys: UsKeys | GermanKeys`, and `Mod+Ö`, `ß`, and `§` type-check. The registered sets replace the US QWERTY punctuation. A-Z, 0-9, named keys, and physical codes are always accepted. 26 layout sets ship as types, from `UkKeys` and `GermanKeys` to `GreekKeys` and `HebrewKeys`, and add no code. This changes types only: hotkeys match the same way, and without a registration the types are unchanged.
