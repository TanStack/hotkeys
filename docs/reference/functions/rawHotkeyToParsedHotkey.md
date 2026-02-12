---
id: rawHotkeyToParsedHotkey
title: rawHotkeyToParsedHotkey
---

# Function: rawHotkeyToParsedHotkey()

```ts
function rawHotkeyToParsedHotkey(raw, platform): ParsedHotkey;
```

Defined in: [parse.ts:98](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/parse.ts#L98)

Converts a RawHotkey object to a ParsedHotkey.
Optional modifier booleans default to false; modifiers array is derived from them.
When `mod` is true, it is resolved to Control or Meta based on platform.

## Parameters

### raw

[`RawHotkey`](../interfaces/RawHotkey.md)

The raw hotkey object

### platform

The target platform for resolving 'Mod' (defaults to auto-detection)

`"mac"` | `"windows"` | `"linux"`

## Returns

[`ParsedHotkey`](../interfaces/ParsedHotkey.md)

A ParsedHotkey suitable for matching and formatting

## Example

```ts
rawHotkeyToParsedHotkey({ key: 'Escape' })
// { key: 'Escape', ctrl: false, shift: false, alt: false, meta: false, modifiers: [] }

rawHotkeyToParsedHotkey({ key: 'S', mod: true }, 'mac')
// { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }

rawHotkeyToParsedHotkey({ key: 'S', mod: true, shift: true }, 'windows')
// { key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] }
```
