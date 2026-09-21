---
id: ThreeModifierHotkey
title: ThreeModifierHotkey
---

```ts
type ThreeModifierHotkey = 
  | `Control+Alt+Shift+${Key}`
  | `Control+Alt+Meta+${Key}`
  | `Control+Shift+Meta+${Key}`
  | `Alt+Shift+Meta+${Key}`
  | `Mod+Alt+Shift+${Key}`;
```

Defined in: [hotkey.types.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L53)

Three modifier + key combinations.

**Platform-adaptive `Mod` combinations:**
- `Mod+Alt+Shift` is included (safe on all platforms)
- `Mod+Control+Shift` and `Mod+Shift+Meta` are excluded because they create duplicate modifiers:
  - `Mod+Control+Shift` duplicates `Control` on Windows/Linux (Mod = Control)
  - `Mod+Shift+Meta` duplicates `Meta` on macOS (Mod = Meta)
