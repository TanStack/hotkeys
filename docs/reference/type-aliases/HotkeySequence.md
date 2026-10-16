---
id: HotkeySequence
title: HotkeySequence
---

```ts
type HotkeySequence = ReadonlyArray<HotkeyChord>;
```

Defined in: [hotkey.types.ts:210](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L210)

A sequence of chords pressed one after another (Vim-style), such as `['G', 'G']`.

Steps may include modifiers; the same modifier can appear on consecutive
steps (e.g. `['Shift+R', 'Shift+T']`). Modifier-only key events do not
advance or reset matching. Automatic repeats and IME composition are ignored.
A one-step sequence is treated as its single chord.
