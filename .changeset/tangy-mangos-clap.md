---
'@tanstack/hotkeys': patch
---

`formatForDisplay` and `formatWithLabels` now order macOS modifier keys according to Apple's Human Interface Guidelines: Control → Option → Shift → Command. For example, `Mod+Shift+S` on macOS now renders as `⇧ ⌘ S` instead of `⌘ ⇧ S`. Windows and Linux output is unchanged.
