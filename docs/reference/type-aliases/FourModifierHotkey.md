---
id: FourModifierHotkey
title: FourModifierHotkey
---

```ts
type FourModifierHotkey = `Control+Alt+Shift+Meta+${Key}`;
```

Defined in: [hotkey.types.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L72)

Four modifier + key combinations.

Only the canonical `Control+Alt+Shift+Meta` combination is included.

**Why no `Mod` combinations?**
Since `Mod` resolves to either `Control` (Windows/Linux) or `Meta` (macOS), any
four-modifier combination with `Mod` would create duplicate modifiers on one platform.
For example:
- `Mod+Control+Alt+Shift` → duplicates `Control` on Windows/Linux
- `Mod+Alt+Shift+Meta` → duplicates `Meta` on macOS
