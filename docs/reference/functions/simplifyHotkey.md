---
id: simplifyHotkey
title: simplifyHotkey
---

```ts
function simplifyHotkey<T>(hotkey): T extends HotkeySequence ? Hotkey : T extends RegisterableHotkeySequence ? RegisterableHotkey : T;
```

Defined in: [parse.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L60)

Collapses a one-step sequence to its chord without otherwise changing the hotkey.
Registration APIs treat `['Mod+S']` exactly like `'Mod+S'`.

## Type Parameters

### T

`T` *extends* [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

## Parameters

### hotkey

`T`

## Returns

`T` *extends* [`HotkeySequence`](../type-aliases/HotkeySequence.md) ? [`Hotkey`](../type-aliases/Hotkey.md) : `T` *extends* [`RegisterableHotkeySequence`](../type-aliases/RegisterableHotkeySequence.md) ? [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md) : `T`
