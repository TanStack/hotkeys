---
id: parseRegisterableHotkey
title: parseRegisterableHotkey
---

```ts
function parseRegisterableHotkey(hotkey, platform?): ParsedHotkey;
```

Defined in: [parse.ts:380](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L380)

Parses a string or raw binding, resolving Mod for the supplied platform.
Physical tokens such as `[KeyQ]` retain `code`; they never become logical Q.

## Parameters

### hotkey

[`RegisterableHotkeyChord`](../type-aliases/RegisterableHotkeyChord.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)
