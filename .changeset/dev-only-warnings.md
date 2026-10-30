---
'@tanstack/hotkeys': minor
---

Console warnings and errors are logged only in development. Production builds, where `process.env.NODE_ENV` is `'production'`, skip them and drop the warning code. `checkHotkey` still returns whether a hotkey is valid.
