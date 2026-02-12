---
id: MODIFIER_KEYS
title: MODIFIER_KEYS
---

# Variable: MODIFIER\_KEYS

```ts
const MODIFIER_KEYS: Set<string>;
```

Defined in: [constants.ts:79](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/constants.ts#L79)

Set of canonical modifier key names for fast lookup.

Derived from `MODIFIER_ORDER` to ensure consistency. Used to detect when
a modifier is released so we can clear non-modifier keys whose keyup events
may have been swallowed by the OS (e.g. macOS Cmd+key combos).
