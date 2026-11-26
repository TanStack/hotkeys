---
'@tanstack/hotkeys': minor
---

Starting a recorder cancels any other recorder that is recording, and calls its `onCancel`. Before, both recorded the next key press, so one press could be saved for two shortcuts.
