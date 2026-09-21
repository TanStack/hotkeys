---
id: ConflictBehavior
title: ConflictBehavior
---

```ts
type ConflictBehavior = "warn" | "error" | "replace" | "allow";
```

Defined in: [hotkey.types.ts:269](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L269)

Behavior when registering a hotkey/sequence that conflicts with an existing registration.

- `'warn'` - Log a warning to the console but allow both registrations (default)
- `'error'` - Throw an error and prevent the new registration
- `'replace'` - Unregister the existing registration and register the new one
- `'allow'` - Allow multiple registrations without warning
