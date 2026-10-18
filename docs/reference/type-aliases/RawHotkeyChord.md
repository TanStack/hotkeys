---
id: RawHotkeyChord
title: RawHotkeyChord
---

```ts
type RawHotkeyChord = 
  | object & RawModifiers
  | object & RawModifiers;
```

Defined in: [hotkey.types.ts:195](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L195)

A chord written as an object instead of a string, for building chords from
data. Set `key` for a logical key or `code` for a physical one, and set a
boolean for each modifier. Omitted modifiers default to `false`.

The `mod` modifier is platform-adaptive: Command on macOS, Control on Windows/Linux.
Sequence steps can be objects too: `[{ key: 'K', mod: true }, 'C']`.

## Example

```ts
useHotkey({ key: 'S', mod: true }, handler)             // Mod+S (cross-platform)
useHotkey({ key: 'S', ctrl: true }, handler)            // Control+S
useHotkey({ key: 'Escape' }, handler)                   // Escape (no modifiers)
useHotkey({ key: 'A', shift: true, meta: true }, handler) // Shift+Meta+A
useHotkey({ key: 'S', mod: true, shift: true }, handler)  // Mod+Shift+S
useHotkey({ code: 'KeyW', mod: true }, handler)           // Physical Mod+KeyW
useHotkey({ code: 'NumpadAdd', mod: true }, handler)      // Physical numpad plus
```
