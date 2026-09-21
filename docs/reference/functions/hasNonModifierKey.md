---
id: hasNonModifierKey
title: hasNonModifierKey
---

```ts
function hasNonModifierKey(hotkey, platform): boolean;
```

Defined in: [parse.ts:336](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L336)

Checks if a hotkey or ParsedHotkey contains at least one non-modifier key.

This is useful for validating that a recorded hotkey is complete and not
just a combination of modifiers without an action key.

## Parameters

### hotkey

The hotkey string or ParsedHotkey to check

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object` | [`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

### platform

The target platform for parsing (defaults to auto-detection)

`"mac"` | `"windows"` | `"linux"`

## Returns

`boolean`

True if the hotkey contains at least one non-modifier key

## Example

```ts
hasNonModifierKey('Control+Shift+S') // true
hasNonModifierKey('Control+Shift') // false (no action key)
hasNonModifierKey(parseHotkey('Mod+A')) // true
```
