---
'@tanstack/hotkeys': patch
---

Fix server renders in FastBoot when a component reads held keys or a hotkey hint. FastBoot defines a `window` that can't listen for events, and the key state tracker called `window.addEventListener` on it. The tracker now skips its listeners when `window` can't listen, so held-key readers return no keys and hints stay hidden on the server.
