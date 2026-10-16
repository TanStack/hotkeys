---
id: parseHotkey
title: parseHotkey
---

```ts
function parseHotkey(hotkey, platform?): ParsedHotkey;
```

Defined in: [parse.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L75)

Parses a hotkey string into its component parts.

## Parameters

### hotkey

[`HotkeyChord`](../type-aliases/HotkeyChord.md) \| `string` & `object`

The hotkey string to parse (e.g., 'Mod+Shift+S')

### platform?

`"mac"` \| `"windows"` \| `"linux"`

The target platform for resolving 'Mod' (defaults to auto-detection)

## Returns

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

A ParsedHotkey with either logical key or physical code and modifier flags

## Example

```ts
parseHotkey('Mod+S') // On Mac: { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
parseHotkey('Mod+S') // On Windows: { key: 'S', ctrl: true, shift: false, alt: false, meta: false, modifiers: ['Control'] }
parseHotkey('Control+Shift+A') // { key: 'A', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control', 'Shift'] }
```
