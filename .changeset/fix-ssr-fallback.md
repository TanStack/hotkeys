---
'@tanstack/hotkeys': patch
---

Fix SSR fallback issue in HotkeyManager.register() - return a no-op handle instead of creating a fake Document object when running in SSR environments
