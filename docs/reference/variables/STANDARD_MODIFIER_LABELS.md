---
id: STANDARD_MODIFIER_LABELS
title: STANDARD_MODIFIER_LABELS
---

# Variable: STANDARD\_MODIFIER\_LABELS

```ts
const STANDARD_MODIFIER_LABELS: Record<CanonicalModifier, string>;
```

Defined in: [constants.ts:481](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/constants.ts#L481)

Modifier key labels for Windows/Linux display.

Used by formatting functions to display hotkeys with standard text labels
(e.g., 'Ctrl' for Control, 'Win' for Meta/Windows key) instead of symbols.
This provides a familiar Windows/Linux look and feel in hotkey displays.

## Example

```ts
STANDARD_MODIFIER_LABELS['Control'] // 'Ctrl'
STANDARD_MODIFIER_LABELS['Meta'] // 'Win'
STANDARD_MODIFIER_LABELS['Alt'] // 'Alt'
STANDARD_MODIFIER_LABELS['Shift'] // 'Shift'
```
