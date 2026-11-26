---
'@tanstack/hotkeys': patch
---

`setCustomHotkey` no longer saves a value that isn't a valid hotkey, such as `''`. Loading dropped such a value, so the hotkey went back to its default after a reload. In development, it warns about an invalid value or an unknown id.
