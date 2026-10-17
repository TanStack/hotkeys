---
id: parseKeyboardEvent
title: parseKeyboardEvent
---

```ts
function parseKeyboardEvent(event, platform?): ParsedHotkeyChord;
```

Defined in: [parse.ts:308](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L308)

Parses a KeyboardEvent into the chord it pressed, in the same format as
`parseHotkey()`. Pass the result to `normalizeHotkey` for its canonical string.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to parse

### platform?

`Platform`

The target platform for resolving modifiers (defaults to auto-detection)

## Returns

[`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)

The parsed chord for the keyboard event

## Example

```ts
document.addEventListener('keydown', (event) => {
  const parsed = parseKeyboardEvent(event)
  console.log(parsed) // { key: 'S', ctrl: true, shift: false, ... }
})
```
