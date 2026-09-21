---
id: HotkeySequence
title: HotkeySequence
---

```ts
type HotkeySequence = Hotkey[];
```

Defined in: [sequence-manager.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L52)

A sequence of hotkeys for Vim-style shortcuts.

Each element is one step (a `Hotkey` string). Steps may include modifiers;
the same modifier can appear on consecutive steps (e.g. `Shift+R` then
`Shift+T`). Modifier-only key events do not advance or reset matching—see
`SequenceManager`. Automatic keydown repeats and IME composition are also ignored.

## Example

```ts
const gotoTop: HotkeySequence = ['G', 'G']  // gg
const deleteLine: HotkeySequence = ['D', 'D']  // dd
const deleteWord: HotkeySequence = ['D', 'I', 'W']  // diw
const chainedShift: HotkeySequence = ['Shift+R', 'Shift+T']
```
