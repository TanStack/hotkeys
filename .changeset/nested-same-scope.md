---
'@tanstack/hotkeys': patch
---

Fix hotkeys in a scope that stopped firing when a provider with the same scope mounted inside it. The inner provider replaced the scope's parent with the scope itself, so the scope dropped out of an exclusive ancestor such as a dialog.
