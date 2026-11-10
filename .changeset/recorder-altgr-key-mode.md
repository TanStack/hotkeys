---
'@tanstack/hotkeys': patch
---

The recorder with `recordBy: 'key'` now rejects an AltGr press that types nothing new, such as AltGr+Home on Linux, with `reason: 'alt-graph'`. Before, it recorded `Home`, which that press never fires. AltGr presses that type a character, such as `@`, still record that character.
