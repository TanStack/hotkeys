---
'@tanstack/hotkeys': minor
---

Let focused controls keep their own keys when `ignoreInputs` is on. Hotkeys now skip Enter and Space on buttons and `<summary>`, Enter on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, trees, and grids, for any target that contains the focused control. A hotkey targeted at the control itself, or `ignoreInputs: false`, still receives these keys. The hotkey recorder now only skips text fields, so it can record Enter and Space while its button has focus.
