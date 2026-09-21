---
id: normalizeHotkeyFromEvent
title: normalizeHotkeyFromEvent
---

```ts
function normalizeHotkeyFromEvent(event, platform?): Hotkey;
```

Defined in: [parse.ts:292](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L292)

Normalizes a keyboard event to the same canonical hotkey string as [normalizeHotkey](normalizeHotkey.md).

## Parameters

### event

`KeyboardEvent`

The keyboard event (typically `keydown`)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

Target platform for `Mod` eligibility

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)
