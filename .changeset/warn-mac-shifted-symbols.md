---
'@tanstack/hotkeys': patch
---

In development, registering a Mac hotkey with Command and a shifted US symbol, such as `Mod++` or `Mod+?`, warns that it can't fire on a US Mac keyboard, because macOS reports the unshifted character with Command held. Register it with Shift and the unshifted key instead. The binding still works on Mac layouts that type the symbol without Shift, such as `+` on German, so keep it next to the Shift form if you support those.
