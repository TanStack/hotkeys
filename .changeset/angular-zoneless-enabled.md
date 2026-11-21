---
'@tanstack/angular-hotkeys': patch
---

In zoneless apps, a hotkey callback that changes a hotkey's or provider's `enabled` now takes effect before the browser sends the next key. Before, the change waited for Angular's next scheduled change detection, so a quick second press, such as from Playwright's `keyboard.press`, still matched the old value. Zoneless apps now run change detection in a microtask after a hotkey callback returns, and again when an async callback settles. Keys dispatched in one synchronous loop still see the value from before the loop.
