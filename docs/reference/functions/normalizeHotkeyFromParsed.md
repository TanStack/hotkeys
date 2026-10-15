---
id: normalizeHotkeyFromParsed
title: normalizeHotkeyFromParsed
---

```ts
function normalizeHotkeyFromParsed(parsed, platform?): HotkeyChord;
```

Defined in: [parse.ts:242](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L242)

Same canonical string as [normalizeHotkey](normalizeHotkey.md), but from an already-parsed hotkey.

## Parameters

### parsed

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

[`HotkeyChord`](../type-aliases/HotkeyChord.md)
