---
id: formatHotkeySequence
title: formatHotkeySequence
---

```ts
function formatHotkeySequence(sequence): string;
```

Defined in: [format.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L38)

Joins stored sequence steps with spaces, preserving physical code tokens.
For user-facing labels, call formatForDisplay on each step instead.

## Parameters

### sequence

[`Hotkey`](../type-aliases/Hotkey.md)[]

Array of hotkey strings that form the sequence

## Returns

`string`

A space-separated string (e.g. ['G','G'] → 'G G')

## Example

```ts
formatHotkeySequence(['G', 'G'])      // 'G G'
formatHotkeySequence(['D', 'I', 'W']) // 'D I W'
```
