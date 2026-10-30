---
id: DisplayHotkeyChord
title: DisplayHotkeyChord
---

```ts
type DisplayHotkeyChord = 
  | RegisterableHotkeyChord
  | ParsedHotkeyChord
  | CanonicalModifier;
```

Defined in: [format.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L72)

A single chord to display: a hotkey string, which includes single keys, a
modifier on its own, a raw object such as `{ key }`, or a parsed hotkey.
