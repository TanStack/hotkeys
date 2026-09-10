---
id: normalizeHotkeyFromEvent
title: normalizeHotkeyFromEvent
---

# Function: normalizeHotkeyFromEvent()

```ts
function normalizeHotkeyFromEvent(event, platform): Hotkey;
```

Defined in: [parse.ts:292](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L292)

Normalizes a keyboard event to the same canonical hotkey string as [normalizeHotkey](normalizeHotkey.md).

## Parameters

### event

`KeyboardEvent`

The keyboard event (typically `keydown`)

### platform

Target platform for `Mod` eligibility

`"mac"` | `"windows"` | `"linux"`

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)
