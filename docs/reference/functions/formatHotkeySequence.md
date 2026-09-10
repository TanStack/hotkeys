---
id: formatHotkeySequence
title: formatHotkeySequence
---

# Function: formatHotkeySequence()

```ts
function formatHotkeySequence(sequence): string;
```

Defined in: [format.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L37)

Converts a hotkey sequence array to a display string.

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
