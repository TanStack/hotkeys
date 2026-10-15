---
id: isHotkeySequence
title: isHotkeySequence
---

```ts
function isHotkeySequence(hotkey): hotkey is HotkeySequence;
```

Defined in: [parse.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L23)

Whether a hotkey is a sequence. Use this instead of `Array.isArray`, which
does not narrow readonly arrays.

## Parameters

### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

## Returns

`hotkey is HotkeySequence`
