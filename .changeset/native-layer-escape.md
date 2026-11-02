---
'@tanstack/hotkeys': minor
---

Leave Escape to an open modal `<dialog>` or popover. While one is open, hotkeys outside it skip Escape, so the browser closes it instead of a global `Escape` hotkey keeping it open. A hotkey targeted at the dialog or popover, or at an element inside it, still receives Escape.
