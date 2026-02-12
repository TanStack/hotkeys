---
id: convertToModFormat
title: convertToModFormat
---

# Function: convertToModFormat()

```ts
function convertToModFormat(hotkey, platform): Hotkey;
```

Defined in: [parse.ts:345](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/parse.ts#L345)

Converts a hotkey string to use 'Mod' format for portability.

On macOS, converts 'Meta' to 'Mod'. On Windows/Linux, converts 'Control' to 'Mod'.
This enables cross-platform hotkey definitions that work consistently.

## Parameters

### hotkey

The hotkey string to convert

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object`

### platform

The target platform (defaults to auto-detection)

`"mac"` | `"windows"` | `"linux"`

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)

The hotkey string with 'Mod' format applied

## Example

```ts
convertToModFormat('Meta+S', 'mac') // 'Mod+S'
convertToModFormat('Control+S', 'windows') // 'Mod+S'
convertToModFormat('Control+Meta+S', 'mac') // 'Control+Meta+S' (both present, no conversion)
```
