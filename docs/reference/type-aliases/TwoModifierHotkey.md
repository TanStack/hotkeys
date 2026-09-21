---
id: TwoModifierHotkey
title: TwoModifierHotkey
---

```ts
type TwoModifierHotkey = 
  | `Control+Alt+${Key}`
  | `Control+Shift+${Key}`
  | `Control+Meta+${Key}`
  | `Alt+Shift+${Key}`
  | `Alt+Meta+${Key}`
  | `Shift+Meta+${Key}`
  | `Mod+Alt+${Key}`
  | `Mod+Shift+${Key}`;
```

Defined in: [hotkey.types.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L34)

Two modifier + key combinations.

**Platform-adaptive `Mod` combinations:**
- `Mod+Alt` and `Mod+Shift` are included (safe on all platforms)
- `Mod+Control` and `Mod+Meta` are excluded because they create duplicate modifiers:
  - `Mod+Control` duplicates `Control` on Windows/Linux (Mod = Control)
  - `Mod+Meta` duplicates `Meta` on macOS (Mod = Meta)
