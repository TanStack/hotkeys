---
'@tanstack/hotkeys': patch
---

A keyup chord no longer fires after another key was pressed in between when that key never reached the chord's own listener. One case is a key that a hotkey on an inner element stopped. Another is a key pressed while focus was outside the chord's target, which another hotkey's listener heard. A keyup chord also no longer fires on a later modifier release after its key was released outside its target. A press now ends at the first release of its key or one of its modifiers, and any other key press cancels it, at whichever of the hotkey manager's listeners hears that key first.
