---
id: formatHotkey
title: formatHotkey
---

## Call Signature

```ts
function formatHotkey(parsed): string;
```

Defined in: [format.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L36)

Converts a parsed hotkey back to a string, with each platform modifier
spelled out, such as `Control+Shift+S`. A parsed chord returns a string, and
a parsed sequence returns one string per step. To get `Mod` back where the
platform allows it, use `normalizeHotkey` instead.

### Parameters

#### parsed

[`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)

A parsed chord, or the parsed steps of a sequence

### Returns

`string`

### Example

```ts
formatHotkey(parseHotkey('Mod+Shift+S', 'windows')) // 'Control+Shift+S'
formatHotkey(parseHotkey(['G', 'Mod+K'], 'mac')) // ['G', 'Meta+K']
```

## Call Signature

```ts
function formatHotkey(parsed): string[];
```

Defined in: [format.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L37)

Converts a parsed hotkey back to a string, with each platform modifier
spelled out, such as `Control+Shift+S`. A parsed chord returns a string, and
a parsed sequence returns one string per step. To get `Mod` back where the
platform allows it, use `normalizeHotkey` instead.

### Parameters

#### parsed

readonly [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)[]

A parsed chord, or the parsed steps of a sequence

### Returns

`string`[]

### Example

```ts
formatHotkey(parseHotkey('Mod+Shift+S', 'windows')) // 'Control+Shift+S'
formatHotkey(parseHotkey(['G', 'Mod+K'], 'mac')) // ['G', 'Meta+K']
```

## Call Signature

```ts
function formatHotkey(parsed): string | string[];
```

Defined in: [format.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L40)

Converts a parsed hotkey back to a string, with each platform modifier
spelled out, such as `Control+Shift+S`. A parsed chord returns a string, and
a parsed sequence returns one string per step. To get `Mod` back where the
platform allows it, use `normalizeHotkey` instead.

### Parameters

#### parsed

  \| [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)
  \| readonly [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)[]

A parsed chord, or the parsed steps of a sequence

### Returns

`string` \| `string`[]

### Example

```ts
formatHotkey(parseHotkey('Mod+Shift+S', 'windows')) // 'Control+Shift+S'
formatHotkey(parseHotkey(['G', 'Mod+K'], 'mac')) // ['G', 'Meta+K']
```
