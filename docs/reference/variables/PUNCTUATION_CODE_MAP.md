---
id: PUNCTUATION_CODE_MAP
title: PUNCTUATION_CODE_MAP
---

# Variable: PUNCTUATION\_CODE\_MAP

```ts
const PUNCTUATION_CODE_MAP: Record<string, string>;
```

Defined in: [constants.ts:313](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L313)

Maps `KeyboardEvent.code` values for punctuation keys to their canonical characters.

On macOS, holding the Option (Alt) key transforms punctuation keys into special characters
(e.g., Option+Minus → en-dash '–'), causing `event.key` to differ from the expected character.
However, `event.code` still reports the physical key (e.g., 'Minus'). This map enables
falling back to `event.code` for punctuation keys, similar to the existing `Key*`/`Digit*`
fallbacks for letters and digits.
