---
'@tanstack/vue-hotkeys': patch
---

Fix three Vue composable bugs:

- Server rendering no longer leaks store subscriptions. Composables return the current state on the server and subscribe only in the browser.
- `useKeyHold` now follows a getter or ref key without waiting for a key event.
- Composables called in an `effectScope` outside a component no longer log `inject()` warnings.
