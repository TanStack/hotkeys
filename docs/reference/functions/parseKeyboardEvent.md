---
id: parseKeyboardEvent
title: parseKeyboardEvent
---

# Function: parseKeyboardEvent()

```ts
function parseKeyboardEvent(event): ParsedHotkey;
```

Defined in: [parse.ts:208](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/parse.ts#L208)

Parses a KeyboardEvent into a ParsedHotkey object.

This function extracts the key and modifier state from a keyboard event
and converts it into the same format used by `parseHotkey()`.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to parse

## Returns

[`ParsedHotkey`](../interfaces/ParsedHotkey.md)

A ParsedHotkey object representing the keyboard event

## Example

```ts
document.addEventListener('keydown', (event) => {
  const parsed = parseKeyboardEvent(event)
  console.log(parsed) // { key: 'S', ctrl: true, shift: false, ... }
})
```
