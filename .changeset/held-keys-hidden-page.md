---
'@tanstack/hotkeys': patch
---

Held keys now clear when the page is hidden, even when a page listener stops the `visibilitychange` event. Before, a listener on the document that called `stopPropagation()` kept the event from the key state tracker, so a key held while the user switched tabs stayed held in `getHeldKeys()` and every adapter's held-key helpers until its next keyup.
