---
'@tanstack/hotkeys': minor
---

Turkish dotless `ı` is now its own key instead of turning into `I`. A hotkey for `ı` no longer fires on the key that types `i`, and `recordBy: 'key'` records `ı`, which displays as `ı`. `I` still fires on the key that types `ı`, as in native Windows apps. macOS Option+Shift+B, which also types `ı`, now fires `Alt+Shift+B` only, not `Alt+Shift+I`.
