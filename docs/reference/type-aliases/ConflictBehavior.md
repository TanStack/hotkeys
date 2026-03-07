---
id: ConflictBehavior
title: ConflictBehavior
---

# Type Alias: ConflictBehavior

```ts
type ConflictBehavior = "warn" | "error" | "replace" | "allow" | (
  keyDisplay: string,
  unregisterConflicting: () => void
) => void;
```

Defined in: [manager.utils.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/manager.utils.ts#L11)

Behavior when registering a hotkey/sequence that conflicts with an existing registration.

- `'warn'` - Log a warning to the console but allow both registrations (default)
- `'error'` - Throw an error and prevent the new registration
- `'replace'` - Unregister the existing registration and register the new one
- `'allow'` - Allow multiple registrations without warning
- custom callback - You can log the issue with configuration or unregister conflicting registration conditionally e.g. with showing confirmation popup 
