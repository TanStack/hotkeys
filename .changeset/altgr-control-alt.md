---
'@tanstack/hotkeys': patch
---

AltGr with a key that types nothing new, such as AltGr+Home, or AltGr+F on a layout with nothing on that key, no longer fires hotkeys without modifiers. Before, AltGr+F fired `F` on layouts such as Windows Norwegian. On Windows, which reports AltGr as Control+Alt, these presses now fire `Control+Alt` hotkeys instead, as in native Windows apps: AltGr+Home triggers `Control+Alt+Home`, and the recorder records it as Control+Alt. Characters typed with AltGr, such as `@` or `€`, still match as before and never trigger `Control+Alt` hotkeys.
