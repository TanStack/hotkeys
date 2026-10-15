---
id: ConflictBehavior
title: ConflictBehavior
---

```ts
type ConflictBehavior = "warn" | "error" | "replace" | "allow" | CustomConflictHandler;
```

Defined in: [hotkey.types.ts:293](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L293)

Behavior when registering a hotkey/sequence that conflicts with an existing registration.

- `'warn'` - Log a warning to the console but allow both registrations (default)
- `'error'` - Throw an error and prevent the new registration
- `'replace'` - Unregister the existing registration and register the new one
- `'allow'` - Allow multiple registrations without warning
- function - Called with the conflicting key display and a callback that
  unregisters the existing registration; the new registration is kept
