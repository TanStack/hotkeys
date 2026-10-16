---
id: normalizeHotkeyFromParsed
title: normalizeHotkeyFromParsed
---

```ts
function normalizeHotkeyFromParsed(parsed, platform?): HotkeyChord;
```

Defined in: [parse.ts:177](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L177)

Same canonical string as [normalizeHotkey](normalizeHotkey.md), but from an already-parsed
hotkey: `Mod` first when the platform allows, then `Alt`, then `Shift`;
otherwise full `Control+Alt+Shift+Meta` order.

## Parameters

### parsed

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

[`HotkeyChord`](../type-aliases/HotkeyChord.md)
