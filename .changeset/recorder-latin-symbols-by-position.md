---
'@tanstack/hotkeys': patch
---

The hotkey recorder now records Shift with a symbol such as the Spanish middle dot (`·`) by position, as it records Shift+/. On a Spanish keyboard, Control+Shift+3 types `·` on Windows and recorded `Mod+Shift+·`, which never fired on a Mac, where Command+Shift+3 reports `3`. It now records `Mod+Shift+[Digit3]`, which fires on both. The recorder counted `·` as a letter because it belongs to the Latin script, and the same applied to other Latin-script symbols and combining marks.
