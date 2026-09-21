---
id: parseKeyboardEvent
title: parseKeyboardEvent
---

```ts
function parseKeyboardEvent(event, platform?): ParsedHotkey;
```

Defined in: [parse.ts:274](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L274)

Parses a KeyboardEvent into a ParsedHotkey object.

This function extracts the key and modifier state from a keyboard event
and converts it into the same format used by `parseHotkey()`.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to parse

### platform?

The target platform for resolving modifiers (defaults to auto-detection)

`"mac"` | `"windows"` | `"linux"`

## Returns

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

A ParsedHotkey object representing the keyboard event

## Example

```ts
document.addEventListener('keydown', (event) => {
  const parsed = parseKeyboardEvent(event)
  console.log(parsed) // { key: 'S', ctrl: true, shift: false, ... }
})
```
