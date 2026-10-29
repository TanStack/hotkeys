---
'@tanstack/lit-hotkeys': patch
---

Fix two Lit controller bugs:

- Controllers no longer leak store subscriptions during server rendering with `@lit-labs/ssr`'s `connectedCallback: true` option. On the server, they read the current state and subscribe to nothing.
- `KeyHoldController` accepts a getter key and reads it again on each host update, so it follows a reactive property. It also reads a key that is already held when it connects.
