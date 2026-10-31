---
'@tanstack/hotkeys': patch
---

`@tanstack/hotkeys/adapter` imports the hotkey manager and app hotkeys from `@tanstack/hotkeys` instead of its own copy. CDNs such as jsDelivr bundle each entry on its own, so adapters loaded from them registered hotkeys on a second manager, and providers given app hotkeys threw. `createAppHotkeysStore` is also exported from `@tanstack/hotkeys`.
