---
id: normalizeHotkey
title: normalizeHotkey
---

## Call Signature

```ts
function normalizeHotkey(hotkey, platform?): HotkeyChord;
```

Defined in: [parse.ts:255](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L255)

Normalizes a hotkey to its canonical string form. Accepts a chord string, a
chord object, a parsed chord, or a sequence of any of these. Each sequence
step is normalized, and a one-step sequence becomes its chord.

- When `Mod` is allowed for the platform (Command on Mac without Control;
  Control on Windows/Linux without Meta): emits `Mod`, then `Alt`, then `Shift`,
  then the key (e.g. `Mod+Shift+E`, `Mod+S`).
- Otherwise: literal modifiers in `Control+Alt+Shift+Meta` order, then the key.
- Resolves aliases and normalizes key casing (e.g. `esc` → `Escape`, `a` → `A`).

### Parameters

#### hotkey

`AnyChord`

The hotkey to normalize

#### platform?

`Platform`

The target platform for resolving `Mod` (defaults to auto-detection)

### Returns

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

### Example

```ts
normalizeHotkey('shift+meta+e', 'mac') // 'Mod+Shift+E'
normalizeHotkey('ctrl+a', 'windows') // 'Mod+A'
normalizeHotkey({ key: 's', mod: true }) // 'Mod+S'
normalizeHotkey(['g', 'shift+g']) // ['G', 'Shift+G']
normalizeHotkey(parseKeyboardEvent(event)) // The chord the event pressed
```

## Call Signature

```ts
function normalizeHotkey(hotkey, platform?): Hotkey;
```

Defined in: [parse.ts:259](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L259)

Normalizes a hotkey to its canonical string form. Accepts a chord string, a
chord object, a parsed chord, or a sequence of any of these. Each sequence
step is normalized, and a one-step sequence becomes its chord.

- When `Mod` is allowed for the platform (Command on Mac without Control;
  Control on Windows/Linux without Meta): emits `Mod`, then `Alt`, then `Shift`,
  then the key (e.g. `Mod+Shift+E`, `Mod+S`).
- Otherwise: literal modifiers in `Control+Alt+Shift+Meta` order, then the key.
- Resolves aliases and normalizes key casing (e.g. `esc` → `Escape`, `a` → `A`).

### Parameters

#### hotkey

`AnyChord` \| readonly `AnyChord`[]

The hotkey to normalize

#### platform?

`Platform`

The target platform for resolving `Mod` (defaults to auto-detection)

### Returns

[`Hotkey`](../type-aliases/Hotkey.md)

### Example

```ts
normalizeHotkey('shift+meta+e', 'mac') // 'Mod+Shift+E'
normalizeHotkey('ctrl+a', 'windows') // 'Mod+A'
normalizeHotkey({ key: 's', mod: true }) // 'Mod+S'
normalizeHotkey(['g', 'shift+g']) // ['G', 'Shift+G']
normalizeHotkey(parseKeyboardEvent(event)) // The chord the event pressed
```
