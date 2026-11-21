---
'@tanstack/hotkeys': patch
---

The long s (`ſ`) is now a key of its own, as Turkish `ı` is. It uppercases to `S`, so a `ſ` hotkey fired on the S key, and the `ſ` that AltGr+W types on German and other Linux layouts counted as AltGr typing nothing new, so it fired nothing. Now a `ſ` hotkey fires only on a key that types `ſ`.
