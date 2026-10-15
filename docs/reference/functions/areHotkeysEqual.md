---
id: areHotkeysEqual
title: areHotkeysEqual
---

```ts
function areHotkeysEqual(
   left, 
   right, 
   platform?): boolean;
```

Defined in: [match.ts:203](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L203)

Compares normalized hotkey identity, including all four modifiers.
Sequences are equal when every step is equal; a one-step sequence equals its chord.
Aliases resolve on the supplied platform. A physical code and a logical key
remain distinct even when one keyboard event could match both.

## Parameters

### left

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### right

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### platform?

`"mac"` \| `"windows"` \| `"linux"`

## Returns

`boolean`
