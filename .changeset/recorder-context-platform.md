---
'@tanstack/hotkeys': minor
---

The recorder's `validate` and `onRecord` context has a `platform` field: the platform the hotkey was recorded on. A recorded `Control` on macOS or `Meta` on Windows and Linux means other keys on the other platforms, so apps that sync hotkeys between machines can store the platform with the hotkey, or reject those modifiers in `validate`.
