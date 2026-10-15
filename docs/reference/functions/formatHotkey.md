---
id: formatHotkey
title: formatHotkey
---

```ts
function formatHotkey(parsed): string;
```

Defined in: [format.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L37)

Converts a ParsedHotkey back to a hotkey string.

## Parameters

### parsed

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

The parsed hotkey object

## Returns

`string`

A hotkey string in canonical form

## Example

```ts
formatHotkey({ key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] })
// Returns: 'Control+Shift+S'
```
