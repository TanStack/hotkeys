---
id: ALL_KEYS
title: ALL_KEYS
---

# Variable: ALL\_KEYS

```ts
const ALL_KEYS: Set<
  | LetterKey
  | NumberKey
  | FunctionKey
  | NavigationKey
  | EditingKey
| PunctuationKey>;
```

Defined in: [constants.ts:318](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L318)

Set of all valid non-modifier keys.

This is the union of all key type sets (letters, numbers, function keys, navigation,
editing, and punctuation). Used primarily for validation to check if a key string
is recognized and will have type-safe autocomplete support.

## See

 - [LETTER\_KEYS](LETTER_KEYS.md)
 - [NUMBER\_KEYS](NUMBER_KEYS.md)
 - [FUNCTION\_KEYS](FUNCTION_KEYS.md)
 - [NAVIGATION\_KEYS](NAVIGATION_KEYS.md)
 - [EDITING\_KEYS](EDITING_KEYS.md)
 - [PUNCTUATION\_KEYS](PUNCTUATION_KEYS.md)
