---
id: HotkeySequence
title: HotkeySequence
---

# Type Alias: HotkeySequence

```ts
type HotkeySequence = Hotkey[];
```

Defined in: [types.ts:428](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L428)

A sequence of hotkeys for Vim-style shortcuts.

## Example

```ts
const gotoTop: HotkeySequence = ['G', 'G']  // gg
const deleteLine: HotkeySequence = ['D', 'D']  // dd
const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
```
