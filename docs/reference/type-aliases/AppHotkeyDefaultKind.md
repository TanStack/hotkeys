---
id: AppHotkeyDefaultKind
title: AppHotkeyDefaultKind
---

```ts
type AppHotkeyDefaultKind<THotkey> = THotkey extends null ? null : THotkey extends readonly [unknown] ? HotkeyChord : THotkey extends ReadonlyArray<unknown> ? HotkeySequence : HotkeyChord;
```

Defined in: [app-hotkeys.ts:113](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L113)

The kind of a declared default hotkey; a one-step sequence is a chord.

## Type Parameters

### THotkey

`THotkey`
