---
id: NUMBER_KEYS
title: NUMBER_KEYS
---

# Variable: NUMBER\_KEYS

```ts
const NUMBER_KEYS: Set<NumberKey>;
```

Defined in: [constants.ts:205](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L205)

Set of all valid number keys (0-9).

Note: Number keys are affected by Shift (Shift+1 → '!' on US layout),
so they're excluded from Shift-based hotkey combinations to avoid
layout-dependent behavior.
