---
id: normalizeHotkey
title: normalizeHotkey
---

```ts
function normalizeHotkey(hotkey, platform?): Hotkey;
```

Defined in: [parse.ts:205](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L205)

Normalizes a hotkey string to its canonical form.

- When `Mod` is allowed for the platform (Command on Mac without Control;
  Control on Windows/Linux without Meta): emits `Mod`, then `Alt`, then `Shift`,
  then the key (e.g. `Mod+Shift+E`, `Mod+S`).
- Otherwise: literal modifiers in `Control+Alt+Shift+Meta` order, then the key.
- Resolves aliases and normalizes key casing (e.g. `esc` → `Escape`, `a` → `A`).

## Parameters

### hotkey

[`Key`](../type-aliases/Key.md) \| `string` & `object`

The hotkey string to normalize

### platform?

`"mac"` \| `"windows"` \| `"linux"`

The target platform for resolving `Mod` (defaults to auto-detection)

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)

The normalized hotkey string

## Example

```ts
normalizeHotkey('shift+meta+e', 'mac') // 'Mod+Shift+E'
normalizeHotkey('ctrl+a', 'windows') // 'Mod+A'
normalizeHotkey('esc') // 'Escape'
```
