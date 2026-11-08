---
'@tanstack/hotkeys': patch
---

On Windows, a Latin letter typed with Ctrl+Alt on a letter key, such as Polish Ctrl+Alt+A typing `ą`, no longer falls back to the key's position. `Control+Alt+A` doesn't fire, and the character reaches the text field. Windows treats Ctrl+Alt as AltGr, so this applies when the browser doesn't report AltGraph. Non-Latin letters, symbols such as German Ctrl+Alt+E typing `€`, and the digit row still fall back.
