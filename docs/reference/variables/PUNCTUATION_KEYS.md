---
id: PUNCTUATION_KEYS
title: PUNCTUATION_KEYS
---

# Variable: PUNCTUATION\_KEYS

```ts
const PUNCTUATION_KEYS: Set<PunctuationKey>;
```

Defined in: [constants.ts:293](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L293)

Set of all valid punctuation keys commonly used in keyboard shortcuts.

These are the literal characters as they appear in `KeyboardEvent.key` (layout-dependent,
typically US keyboard layout). Common shortcuts include:
- `Mod+/` - Toggle comment
- `Mod+[` / `Mod+]` - Indent/outdent
- `Mod+=` / `Mod+-` - Zoom in/out

Note: Punctuation keys are affected by Shift (Shift+',' → '<' on US layout),
so they're excluded from Shift-based hotkey combinations to avoid layout-dependent behavior.
