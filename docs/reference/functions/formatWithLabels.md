---
id: formatWithLabels
title: formatWithLabels
---

# Function: formatWithLabels()

```ts
function formatWithLabels(hotkey, platform): string;
```

Defined in: [format.ts:127](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/format.ts#L127)

Formats a hotkey using platform-agnostic labels.
Uses 'Cmd' on Mac and 'Ctrl' for Control, etc.

## Parameters

### hotkey

The hotkey string or ParsedHotkey to format

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object`

### platform

The target platform

`"mac"` | `"windows"` | `"linux"`

## Returns

`string`

A formatted string with platform-appropriate labels
