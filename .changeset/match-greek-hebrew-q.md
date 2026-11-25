---
'@tanstack/hotkeys': patch
---

`Mod+Q` fires on Greek and Hebrew layouts, which type `;` and `/` on the Q key, when the browser's legacy `keyCode` still names Q: on Windows, and for Hebrew in Chromium and Firefox on Linux. Greek `Ctrl+Q` in Chromium on Linux reports the code of `;`, so the guide suggests also registering `Mod+[KeyQ]` where Greek users need it.
