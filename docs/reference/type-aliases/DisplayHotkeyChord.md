---
id: DisplayHotkeyChord
title: DisplayHotkeyChord
---

```ts
type DisplayHotkeyChord = 
  | RegisterableHotkeyChord
  | ParsedHotkeyChord
  | string & object;
```

Defined in: [format.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L69)

A single chord to display: a string, raw object, or parsed hotkey.
