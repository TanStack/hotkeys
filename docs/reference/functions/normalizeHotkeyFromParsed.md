---
id: normalizeHotkeyFromParsed
title: normalizeHotkeyFromParsed
---

```ts
function normalizeHotkeyFromParsed(parsed, platform?): Hotkey;
```

Defined in: [parse.ts:218](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L218)

Same canonical string as [normalizeHotkey](normalizeHotkey.md), but from an already-parsed hotkey.

## Parameters

### parsed

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)
