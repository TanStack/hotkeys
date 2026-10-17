---
id: isHotkeySequence
title: isHotkeySequence
---

```ts
function isHotkeySequence<T>(hotkey): hotkey is Extract<T, readonly unknown[]>;
```

Defined in: [parse.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L50)

Whether a hotkey is a sequence. Use this instead of `Array.isArray`, which
does not narrow readonly arrays.

## Type Parameters

### T

`T` *extends* [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

## Parameters

### hotkey

`T`

## Returns

`hotkey is Extract<T, readonly unknown[]>`
