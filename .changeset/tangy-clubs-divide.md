---
'@tanstack/react-hotkeys': patch
---

Fixed `useHotkey` updating registration options during the render phase. Options are now synced in an effect after the UI commits, so store subscribers (like `useHotkeyRegistrations`) are no longer notified mid-render, which could trigger React warnings and inconsistent state. Fixes #113.
