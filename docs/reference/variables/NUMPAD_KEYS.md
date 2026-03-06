---
id: NUMPAD_KEYS
title: NUMPAD_KEYS
---

# Variable: NUMPAD\_KEYS

```ts
const NUMPAD_KEYS: Set<NumpadKey>;
```

Defined in: [constants.ts:314](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L314)

Set of all valid numpad keys.

Numpad keys are commonly used for data entry and calculator-style input.
They produce distinct `event.key` values from the main number row:
- `Numpad0`-`Numpad9` for digits
- `NumpadAdd`, `NumpadSubtract`, `NumpadMultiply`, `NumpadDivide` for operators
- `NumpadDecimal` for the decimal point
- `NumpadEnter` for the numpad enter key
