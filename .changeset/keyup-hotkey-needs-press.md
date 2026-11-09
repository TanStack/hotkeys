---
'@tanstack/hotkeys': minor
---

A hotkey with `eventType: 'keyup'` now fires only for the release of a press that matched it. Before, any matching keyup fired it: a release whose press happened before the page had focus, or pressing A, then Control, then releasing A for a `Control+A` keyup hotkey. A hotkey that a callback enables during its own keydown, such as to end a mode, still fires on that release.
