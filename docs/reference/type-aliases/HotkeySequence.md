---
id: HotkeySequence
title: HotkeySequence
---

# Type Alias: HotkeySequence

```ts
type HotkeySequence = Hotkey[];
```

Defined in: [sequence.ts:30](https://github.com/TanStack/keys/blob/main/packages/keys/src/sequence.ts#L30)

A sequence of hotkeys for Vim-style shortcuts.

## Example

```ts
const gotoTop: HotkeySequence = ['G', 'G']  // gg
const deleteLine: HotkeySequence = ['D', 'D']  // dd
const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
```
