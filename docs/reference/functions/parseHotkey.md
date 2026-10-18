---
id: parseHotkey
title: parseHotkey
---

## Call Signature

```ts
function parseHotkey(hotkey, platform?): ParsedHotkeyChord;
```

Defined in: [parse.ts:211](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L211)

Parses a hotkey, resolving `Mod` for the platform. A chord, written as a
string or an object, returns one parsed chord. A sequence returns one
parsed chord per step. Physical tokens such as `[KeyQ]` keep `code`; they
never become a logical Q.

### Parameters

#### hotkey

`AnyChord`

A chord string such as `'Mod+S'`, a chord object, or a sequence

#### platform?

`Platform`

The target platform for resolving 'Mod' (defaults to auto-detection)

### Returns

[`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)

### Example

```ts
parseHotkey('Mod+S', 'mac') // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
parseHotkey({ key: 'S', mod: true }, 'windows') // { key: 'S', ctrl: true, ..., modifiers: ['Control'] }
parseHotkey(['G', 'Shift+G']) // [{ key: 'G', ... }, { key: 'G', shift: true, ... }]
```

## Call Signature

```ts
function parseHotkey(hotkey, platform?): ParsedHotkeyChord[];
```

Defined in: [parse.ts:215](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L215)

Parses a hotkey, resolving `Mod` for the platform. A chord, written as a
string or an object, returns one parsed chord. A sequence returns one
parsed chord per step. Physical tokens such as `[KeyQ]` keep `code`; they
never become a logical Q.

### Parameters

#### hotkey

readonly `AnyChord`[]

A chord string such as `'Mod+S'`, a chord object, or a sequence

#### platform?

`Platform`

The target platform for resolving 'Mod' (defaults to auto-detection)

### Returns

[`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)[]

### Example

```ts
parseHotkey('Mod+S', 'mac') // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
parseHotkey({ key: 'S', mod: true }, 'windows') // { key: 'S', ctrl: true, ..., modifiers: ['Control'] }
parseHotkey(['G', 'Shift+G']) // [{ key: 'G', ... }, { key: 'G', shift: true, ... }]
```

## Call Signature

```ts
function parseHotkey(hotkey, platform?): 
  | ParsedHotkeyChord
  | ParsedHotkeyChord[];
```

Defined in: [parse.ts:219](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L219)

Parses a hotkey, resolving `Mod` for the platform. A chord, written as a
string or an object, returns one parsed chord. A sequence returns one
parsed chord per step. Physical tokens such as `[KeyQ]` keep `code`; they
never become a logical Q.

### Parameters

#### hotkey

`AnyChord` \| readonly `AnyChord`[]

A chord string such as `'Mod+S'`, a chord object, or a sequence

#### platform?

`Platform`

The target platform for resolving 'Mod' (defaults to auto-detection)

### Returns

  \| [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)
  \| [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)[]

### Example

```ts
parseHotkey('Mod+S', 'mac') // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
parseHotkey({ key: 'S', mod: true }, 'windows') // { key: 'S', ctrl: true, ..., modifiers: ['Control'] }
parseHotkey(['G', 'Shift+G']) // [{ key: 'G', ... }, { key: 'G', shift: true, ... }]
```
