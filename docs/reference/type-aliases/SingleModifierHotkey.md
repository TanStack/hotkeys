---
id: SingleModifierHotkey
title: SingleModifierHotkey
---

```ts
type SingleModifierHotkey = 
  | `Control+${Key}`
  | `Alt+${Key}`
  | `Shift+${Key}`
  | `Meta+${Key}`
  | `Mod+${Key}`;
```

Defined in: [hotkey.types.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L18)

Single modifier + key combinations.
Uses canonical modifiers (4) + Mod (1) = 5 modifiers.

The `Mod` modifier is platform-adaptive:
- **macOS**: Resolves to `Meta` (Command key ⌘)
- **Windows/Linux**: Resolves to `Control` (Ctrl key)

This enables cross-platform hotkey definitions that automatically adapt to the platform.
For example, `Mod+S` becomes `Command+S` on Mac and `Ctrl+S` on Windows/Linux.
