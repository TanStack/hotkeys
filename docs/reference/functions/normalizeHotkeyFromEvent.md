---
id: normalizeHotkeyFromEvent
title: normalizeHotkeyFromEvent
---

```ts
function normalizeHotkeyFromEvent(event, platform?): HotkeyChord;
```

Defined in: [parse.ts:346](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L346)

Normalizes a keyboard event to the same canonical hotkey string as [normalizeHotkey](normalizeHotkey.md).

## Parameters

### event

`KeyboardEvent`

The keyboard event (typically `keydown`)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

Target platform for `Mod` eligibility

## Returns

[`HotkeyChord`](../type-aliases/HotkeyChord.md)
