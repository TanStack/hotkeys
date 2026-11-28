---
'@tanstack/hotkeys': minor
---

The recorder has a `target` option: the window to record key presses in, or its document. Pass a Picture-in-Picture window to record a hotkey from a button inside it. Recording listens only in that window, and `cancelOnBlur` cancels when that window loses focus. Closing the window cancels the recording, and a closed window doesn't start one. The option is read when recording starts and defaults to the page's `window`. Every adapter's recorder accepts it.
