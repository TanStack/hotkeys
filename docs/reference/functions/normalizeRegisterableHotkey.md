---
id: normalizeRegisterableHotkey
title: normalizeRegisterableHotkey
---

```ts
function normalizeRegisterableHotkey(hotkey, platform?): Hotkey;
```

Defined in: [parse.ts:229](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L229)

Normalizes a string or [RawHotkey](../type-aliases/RawHotkey.md) object to the same canonical hotkey string.
Use this in framework adapters instead of branching on `formatHotkey(rawHotkeyToParsedHotkey(...))`.

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)
