---
'@tanstack/hotkeys': minor
---

Add the `ignoreDefaultPrevented` option. A hotkey with it skips a key press that another listener already handled with `preventDefault()`, such as a Radix UI or shadcn/ui dropdown closing on Escape. A hotkey's own `preventDefault` doesn't count. Set it in a provider's default options to apply it to every hotkey.
