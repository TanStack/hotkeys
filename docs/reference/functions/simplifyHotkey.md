---
id: simplifyHotkey
title: simplifyHotkey
---

```ts
function simplifyHotkey<T>(hotkey): T extends HotkeySequence ? Hotkey : T;
```

Defined in: [parse.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L54)

Collapses a one-step sequence to its chord without otherwise changing the hotkey.
Registration APIs treat `['Mod+S']` exactly like `'Mod+S'`.

## Type Parameters

### T

`T` *extends* [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

## Parameters

### hotkey

`T`

## Returns

`T` *extends* [`HotkeySequence`](../type-aliases/HotkeySequence.md) ? [`Hotkey`](../type-aliases/Hotkey.md) : `T`
