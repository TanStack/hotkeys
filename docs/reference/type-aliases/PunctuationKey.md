---
id: PunctuationKey
title: PunctuationKey
---

```ts
type PunctuationKey = 
  | "/"
  | "["
  | "]"
  | "\"
  | "="
  | "-"
  | ","
  | "."
  | ";"
  | "`"
  | "'"
  | "+"
  | "?"
  | "!"
  | "@"
  | "#"
  | "$"
  | "%"
  | "^"
  | "&"
  | ""
  | "("
  | ")"
  | "_"
  | "{"
  | "}"
  | "|"
  | ":"
  | "\""
  | "<"
  | ">"
  | "~";
```

Defined in: [key.types.ts:130](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key.types.ts#L130)

Printable punctuation glyphs used in keyboard shortcuts. Matching uses the
final KeyboardEvent.key glyph, independent of which layout produced it.
