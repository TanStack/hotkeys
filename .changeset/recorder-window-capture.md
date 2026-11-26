---
'@tanstack/hotkeys': patch
---

The recorder listens for key presses on the window in the capture phase instead of the document. Escape that cancels a recording no longer also closes a dialog whose library listens on the document in the capture phase, such as Radix. A window listener that starts a recording on a key press no longer records that same press.
