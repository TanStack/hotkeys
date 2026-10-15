---
id: DisplayHotkeyChord
title: DisplayHotkeyChord
---

```ts
type DisplayHotkeyChord = 
  | RegisterableHotkeyChord
  | ParsedHotkey
  | string & object;
```

Defined in: [format.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L55)

A single chord to display: a string, raw object, or parsed hotkey.
