---
id: NamedKey
title: NamedKey
---

```ts
type NamedKey = 
  | typeof SHARED_NAMED_KEYS[number]
  | typeof LOGICAL_ONLY_NAMED_KEYS[number];
```

Defined in: [key.types.ts:165](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key.types.ts#L165)

Additional named logical keys, including media, browser, lock, and input-mode keys.
