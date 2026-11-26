---
'@tanstack/hotkeys': minor
---

The recorder cancels and calls `onCancel` when the window loses focus, as when the user switches apps or tabs. A recording left running took the first key the user pressed after coming back. Set `cancelOnBlur: false` to keep recording.
