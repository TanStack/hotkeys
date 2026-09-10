---
id: normalizeHotkeyFromParsed
title: normalizeHotkeyFromParsed
---

# Function: normalizeHotkeyFromParsed()

```ts
function normalizeHotkeyFromParsed(parsed, platform): Hotkey;
```

Defined in: [parse.ts:210](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L210)

Same canonical string as [normalizeHotkey](normalizeHotkey.md), but from an already-parsed hotkey.

## Parameters

### parsed

[`ParsedHotkey`](../interfaces/ParsedHotkey.md)

### platform

`"mac"` | `"windows"` | `"linux"`

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)
