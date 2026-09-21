---
id: areHotkeysEqual
title: areHotkeysEqual
---

```ts
function areHotkeysEqual(
   left, 
   right, 
   platform): boolean;
```

Defined in: [match.ts:194](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L194)

Compares normalized binding identity, including all four modifiers.
Aliases resolve on the supplied platform. A physical code and a logical key
remain distinct even when one keyboard event could match both.

## Parameters

### left

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### right

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### platform

`"mac"` | `"windows"` | `"linux"`

## Returns

`boolean`
