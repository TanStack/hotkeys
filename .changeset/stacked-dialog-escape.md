---
'@tanstack/hotkeys': patch
---

When modal dialogs stack, a hotkey targeted inside the top one receives Escape again. Before, the dialog underneath also counted, so the hotkey skipped Escape and the browser closed the top dialog instead.
