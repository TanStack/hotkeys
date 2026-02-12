---
id: formatHotkey
title: formatHotkey
---

# Function: formatHotkey()

```ts
function formatHotkey(parsed): string;
```

Defined in: [format.ts:23](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/format.ts#L23)

Converts a ParsedHotkey back to a hotkey string.

## Parameters

### parsed

[`ParsedHotkey`](../interfaces/ParsedHotkey.md)

The parsed hotkey object

## Returns

`string`

A hotkey string in canonical form

## Example

```ts
formatHotkey({ key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] })
// Returns: 'Control+Shift+S'
```
