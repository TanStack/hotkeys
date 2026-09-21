---
id: parseRegisterableHotkey
title: parseRegisterableHotkey
---

```ts
function parseRegisterableHotkey(hotkey, platform): ParsedHotkey;
```

Defined in: [parse.ts:362](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L362)

Parses a string or raw binding, resolving Mod for the supplied platform.
Physical tokens such as `[KeyQ]` retain `code`; they never become logical Q.

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### platform

`"mac"` | `"windows"` | `"linux"`

## Returns

[`ParsedHotkey`](../type-aliases/ParsedHotkey.md)
