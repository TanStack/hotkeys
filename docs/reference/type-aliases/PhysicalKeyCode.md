---
id: PhysicalKeyCode
title: PhysicalKeyCode
---

```ts
type PhysicalKeyCode =
  | `Key${LetterKey}`
  | `Digit${NumberKey}`
  | `Numpad${NumberKey}`
  | `${"Alt" | "Control" | "Meta" | "Shift"}${"Left" | "Right"}`
  | EditingKey
  | NavigationKey
  | FunctionKey
  | typeof SHARED_NAMED_KEYS[number]
  | "Backquote"
  | "Backslash"
  | "BracketLeft"
  | "BracketRight"
  | "Comma"
  | "Equal"
  | "IntlBackslash"
  | "IntlRo"
  | "IntlYen"
  | "Minus"
  | "Period"
  | "Quote"
  | "Semicolon"
  | "Slash"
  | `Lang${1 | 2 | 3 | 4 | 5}`
  | `Numpad${"Add" | "Backspace" | "Clear" | "ClearEntry" | "Comma" | "Decimal" | "Divide" | "Enter" | "Equal" | "Hash" | "MemoryAdd" | "MemoryClear" | "MemoryRecall" | "MemoryStore" | "MemorySubtract" | "Multiply" | "ParenLeft" | "ParenRight" | "Star" | "Subtract"}`
  | "LaunchApp1"
  | "LaunchApp2"
  | "MediaSelect"
  | "Sleep"
  | "Turbo"
  | "Abort"
  | "Resume"
  | "Suspend";
```

Defined in: [key.types.ts:185](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key.types.ts#L185)

Supported physical KeyboardEvent.code names, independent of keyboard layout.
Letter, digit, numpad, and sided modifier names use finite template unions.
`Unidentified` is excluded because it cannot identify a physical key.

## See

https://www.w3.org/TR/uievents-code/
