---
id: LETTER_KEYS
title: LETTER_KEYS
---

# Variable: LETTER\_KEYS

```ts
const LETTER_KEYS: Set<LetterKey>;
```

Defined in: [constants.ts:175](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L175)

Set of all valid letter keys (A-Z).

Used for validation and type checking. Letter keys are matched case-insensitively
in hotkey matching, but normalized to uppercase in canonical form.
