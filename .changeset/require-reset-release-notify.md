---
'@tanstack/hotkeys': patch
---

Releasing a `requireReset` hotkey now notifies `manager.registrations` subscribers that `hasFired` is `false` again. Before, the devtools kept showing `hasFired: true` after the key was released.
