---
'@tanstack/hotkeys': patch
---

Register KeyStateTracker listeners in capture phase so held-key state stays accurate while a HotkeyRecorder / HotkeySequenceRecorder is active.
