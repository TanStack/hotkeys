---
id: hasNonModifierKey
title: hasNonModifierKey
---

```ts
function hasNonModifierKey(chord, platform?): boolean;
```

Defined in: [parse.ts:346](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L346)

Checks if a chord contains at least one non-modifier key.

This is useful for validating that a recorded chord is complete and not
just a combination of modifiers without an action key.

## Parameters

### chord

  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| `string` & `object`
  \| [`ParsedHotkeyChord`](../type-aliases/ParsedHotkeyChord.md)

The chord string or parsed chord to check

### platform?

`Platform` = `...`

The target platform for parsing (defaults to auto-detection)

## Returns

`boolean`

True if the chord contains at least one non-modifier key

## Example

```ts
hasNonModifierKey('Control+Shift+S') // true
hasNonModifierKey('Control+Shift') // false (no action key)
hasNonModifierKey(parseHotkey('Mod+A')) // true
```
