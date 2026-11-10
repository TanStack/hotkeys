---
'@tanstack/hotkeys': patch
---

A global `Escape` hotkey now leaves Escape to a modal `<dialog>` or an open popover inside a shadow root while focus is in it, as it already did for ones in the document. Component libraries such as Material Web keep their dialog there. Before, the hotkey ran and the dialog stayed open. A hotkey targeted at the component that hosts the dialog still receives Escape.
